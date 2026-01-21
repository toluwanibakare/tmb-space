import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';

const API_BASE = import.meta.env.VITE_API_URL || '';
import { LogOut, Calendar, MessageSquare, Users, Star, Trash2, CheckCircle, Clock } from 'lucide-react';

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

  const checkAuth = () => {
    const token = localStorage.getItem('admin_token');
    if (!token) navigate('/admin/login');
  };

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem('admin_token');
      const headers = token ? { 'x-admin-token': token } : {};

      const [bookingsRes, contactsRes, newslettersRes, reviewsRes] =
        await Promise.all([
          fetch(`${API_BASE}/api/admin/bookings`, { headers }),
          fetch(`${API_BASE}/api/admin/contacts`, { headers }),
          fetch(`${API_BASE}/api/admin/newsletter`, { headers }),
          fetch(`${API_BASE}/api/admin/reviews`, { headers }),
        ]);

      const [bookingsJson, contactsJson, newslettersJson, reviewsJson] =
        await Promise.all([
          bookingsRes.json(),
          contactsRes.json(),
          newslettersRes.json(),
          reviewsRes.json(),
        ]);

      if (!bookingsRes.ok || !contactsRes.ok || !newslettersRes.ok || !reviewsRes.ok) {
        throw new Error('Failed to load');
      }

      setBookings(bookingsJson.data || []);
      setContacts(contactsJson.data || []);
      setNewsletters(newslettersJson.data || []);
      setReviews(reviewsJson.data || []);
    } catch (err) {
      toast({
        title: 'Error',
        description: 'Failed to load dashboard data',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogout = () => {
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
      const res = await fetch(`${API_BASE}/api/reviews/${id}`, {
        method: 'DELETE',
        headers: token ? { 'x-admin-token': token } : {},
      });

      if (!res.ok) throw new Error('Delete failed');

      setReviews(prev => prev.filter(r => r.id !== id));
      toast({ title: 'Deleted', description: 'Review removed' });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  const toggleApprove = async (id: string, approved: boolean) => {
    try {
      const token = localStorage.getItem('admin_token');
      const res = await fetch(
        `${API_BASE}/api/admin/reviews/${id}/approve`,
        {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
            ...(token ? { 'x-admin-token': token } : {}),
          },
          body: JSON.stringify({ approved }),
        }
      );

      if (!res.ok) throw new Error('Update failed');

      setReviews(prev =>
        prev.map(r => (r.id === id ? { ...r, approved } : r))
      );

      toast({
        title: 'Updated',
        description: approved ? 'Review approved' : 'Review set to pending',
      });
    } catch (err: any) {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
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
            <h1 className="text-4xl font-bold gradient-text">Admin Dashboard</h1>
            <p className="text-muted-foreground">Manage your website data</p>
          </div>
          <Button onClick={handleLogout} variant="outline" className="gap-2">
            <LogOut size={18} /> Logout
          </Button>
        </motion.div>

        <Card className="glass-effect p-6">
          <Tabs defaultValue="bookings">
            <TabsList className="mb-6">
              <TabsTrigger value="bookings">Bookings</TabsTrigger>
              <TabsTrigger value="contacts">Contacts</TabsTrigger>
              <TabsTrigger value="newsletter">Newsletter</TabsTrigger>
              <TabsTrigger value="reviews">Reviews</TabsTrigger>
            </TabsList>

            <TabsContent value="reviews">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Rating</TableHead>
                    <TableHead>Review</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Created</TableHead>
                    <TableHead>Action</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {reviews.map(review => (
                    <TableRow key={review.id}>
                      <TableCell>
                        {review.is_anonymous ? 'Anonymous' : review.name}
                      </TableCell>
                      <TableCell>{review.rating}</TableCell>
                      <TableCell className="max-w-xs truncate">
                        {review.review}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant={review.approved ? 'secondary' : 'outline'}
                          onClick={() =>
                            toggleApprove(review.id, !review.approved)
                          }
                          className="gap-1"
                        >
                          {review.approved ? (
                            <CheckCircle size={14} />
                          ) : (
                            <Clock size={14} />
                          )}
                          {review.approved ? 'Approved' : 'Pending'}
                        </Button>
                      </TableCell>
                      <TableCell>
                        {new Date(review.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => deleteReview(review.id)}
                          className="gap-1"
                        >
                          <Trash2 size={14} /> Delete
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
};

export default AdminDashboard;
