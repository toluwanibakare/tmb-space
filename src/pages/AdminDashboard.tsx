import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

const API_BASE = import.meta.env.VITE_API_URL || '';
import { LogOut, Calendar, MessageSquare, Users, Star, Trash2 } from 'lucide-react';

const AdminDashboard = () => {
  const [bookings, setBookings] = useState<any[]>([]);
  const [contacts, setContacts] = useState<any[]>([]);
  const [newsletters, setNewsletters] = useState<any[]>([]);
  const [reviews, setReviews] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    checkAuth();
    fetchData();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('admin_token');
    if (!token) {
      navigate('/admin/login');
    }
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const headers = token ? { 'x-admin-token': token } : {};
      const [bookingsRes, contactsRes, newslettersRes, reviewsRes] = await Promise.all([
        fetch(`${API_BASE}/api/admin/bookings`, { headers }),
        fetch(`${API_BASE}/api/admin/contacts`, { headers }),
        fetch(`${API_BASE}/api/admin/newsletter`, { headers }),
        fetch(`${API_BASE}/api/admin/reviews`, { headers }),
      ]);

      const [bookingsJson, contactsJson, newslettersJson, reviewsJson] = await Promise.all([
        bookingsRes.json(),
        contactsRes.json(),
        newslettersRes.json(),
        reviewsRes.json(),
      ]);

      if (!bookingsRes.ok) throw new Error(bookingsJson.error || 'Failed to load');
      if (!contactsRes.ok) throw new Error(contactsJson.error || 'Failed to load');
      if (!newslettersRes.ok) throw new Error(newslettersJson.error || 'Failed to load');
      if (!reviewsRes.ok) throw new Error(reviewsJson.error || 'Failed to load');

      setBookings(bookingsJson.data || []);
      setContacts(contactsJson.data || []);
      setNewsletters(newslettersJson.data || []);
      setReviews(reviewsJson.data || []);
    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = async () => {
    localStorage.removeItem('admin_token');
    navigate('/admin/login');
  };

  const copyEmail = (email: string) => {
    navigator.clipboard.writeText(email);
    toast({ title: 'Copied', description: 'Email copied to clipboard' });
  };

  const deleteReview = async (id: string) => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(`${API_BASE}/api/reviews/${id}`, { method: 'DELETE', headers: token ? { 'x-admin-token': token } : {} });
      if (!res.ok) throw new Error('Delete failed');
      setReviews(reviews.filter(r => r.id !== id));
      toast({ title: 'Deleted', description: 'Review has been removed' });
    } catch (error: any) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-20 px-4">
      <div className="container mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8 flex justify-between items-center"
        >
          <div>
            <h1 className="text-4xl font-heading font-bold mb-2 gradient-text">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your website data</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="gap-2">
            <LogOut size={18} />
            Logout
          </Button>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="glass-effect p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Calendar className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Total Bookings</p>
                <p className="text-3xl font-bold">{bookings.length}</p>
              </div>
            </div>
          </Card>

          <Card className="glass-effect p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <MessageSquare className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Contacts</p>
                <p className="text-3xl font-bold">{contacts.length}</p>
              </div>
            </div>
          </Card>

          <Card className="glass-effect p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Users className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Subscribers</p>
                <p className="text-3xl font-bold">{newsletters.length}</p>
              </div>
            </div>
          </Card>

          <Card className="glass-effect p-6">
            <div className="flex items-center gap-4">
              <div className="p-3 rounded-full bg-primary/10">
                <Star className="w-6 h-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Reviews</p>
                <p className="text-3xl font-bold">{reviews.length}</p>
              </div>
            </div>
          </Card>
        </div>

        <Card className="glass-effect p-6">
          <Tabs defaultValue="bookings">
            <TabsList className="mb-6 flex-wrap">
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
              <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="bookings">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Contact</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Time</TableHead>
                      <TableHead>Created At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookings.map((booking) => (
                      <TableRow key={booking.id}>
                        <TableCell className="font-medium">{booking.name}</TableCell>
                        <TableCell>{booking.contact}</TableCell>
                        <TableCell>{new Date(booking.booking_date).toLocaleDateString()}</TableCell>
                        <TableCell>{booking.booking_time}</TableCell>
                        <TableCell>{new Date(booking.created_at).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="contacts">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>WhatsApp</TableHead>
                      <TableHead>Services</TableHead>
                      <TableHead>Submitted At</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contacts.map((contact) => (
                      <TableRow key={contact.id}>
                        <TableCell className="font-medium">{contact.name}</TableCell>
                        <TableCell>{contact.email}</TableCell>
                        <TableCell>{contact.whatsapp}</TableCell>
                        <TableCell>{contact.services}</TableCell>
                        <TableCell>{new Date(contact.submitted_at).toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="newsletter">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Subscribed At</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {newsletters.map((sub) => (
                      <TableRow key={sub.id}>
                        <TableCell className="font-medium">{sub.email}</TableCell>
                        <TableCell>{new Date(sub.subscribed_at).toLocaleString()}</TableCell>
                        <TableCell>
                          <Button size="sm" variant="outline" onClick={() => copyEmail(sub.email)}>
                            Copy Email
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>

            <TabsContent value="reviews">
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Company</TableHead>
                      <TableHead>Role</TableHead>
                      <TableHead>Rating</TableHead>
                      <TableHead>Review</TableHead>
                      <TableHead>Created At</TableHead>
                      <TableHead>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {reviews.map((review) => (
                      <TableRow key={review.id}>
                        <TableCell className="font-medium">
                          {review.is_anonymous ? 'Anonymous' : review.name}
                        </TableCell>
                        <TableCell>{review.company || '-'}</TableCell>
                        <TableCell>{review.role || '-'}</TableCell>
                        <TableCell>
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <Star
                                key={i}
                                className={`w-4 h-4 ${i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-muted'}`}
                              />
                            ))}
                          </div>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{review.review}</TableCell>
                        <TableCell>{new Date(review.created_at).toLocaleString()}</TableCell>
                        <TableCell>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => deleteReview(review.id)}
                            className="gap-1"
                          >
                            <Trash2 size={14} />
                            Delete
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
