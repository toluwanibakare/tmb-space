import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Star, User } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';

const API_BASE = import.meta.env.VITE_API_URL || '';
import { cn } from '@/lib/utils';

interface Review {
  id: string;
  name: string;
  project_type: string;
  rating: number;
  review: string;
  created_at: string;
  is_anonymous: boolean;
  company?: string;
  role?: string;
}

const Reviews = () => {
  const { toast } = useToast();
  const [reviews, setReviews] = useState<Review[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    project_type: '',
    rating: 0,
    review: '',
    is_anonymous: false,
    company: '',
    role: '',
  });
  const [hoveredRating, setHoveredRating] = useState(0);

  // Fetch existing reviews
  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`${API_BASE}/api/reviews`);
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to fetch reviews');
      setReviews(json.data || []);
    } catch (error) {
      console.error('Error fetching reviews:', error);
      toast({
        title: 'Error',
        description: 'Failed to load reviews. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (formData.rating === 0) {
      toast({
        title: 'Rating Required',
        description: 'Please select a rating',
        variant: 'destructive',
      });
      return;
    }

    if (!formData.review.trim()) {
      toast({
        title: 'Review Required',
        description: 'Please write your review',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const reviewData = {
        name: formData.is_anonymous ? 'Anonymous' : formData.name.trim(),
        project_type: formData.project_type,
        rating: formData.rating,
        review: formData.review,
        is_anonymous: formData.is_anonymous,
        company: formData.company.trim() || null,
        role: formData.role.trim() || null,
      };

      const res = await fetch(`${API_BASE}/api/reviews`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(reviewData),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error || 'Failed to submit review');

      toast({
        title: 'Review Submitted!',
        description: 'Thank you for your feedback!',
      });

      // Reset form
      setFormData({
        name: '',
        project_type: '',
        rating: 0,
        review: '',
        is_anonymous: false,
        company: '',
        role: '',
      });

      // Refresh reviews list
      await fetchReviews();
    } catch (error) {
      console.error('Error submitting review:', error);
      toast({
        title: 'Error',
        description: 'Failed to submit review. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  };

  const StarRating = ({ rating, onRate, isInteractive = false }: { 
    rating: number; 
    onRate?: (rating: number) => void;
    isInteractive?: boolean;
  }) => {
    return (
      <div className="flex gap-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            onClick={() => isInteractive && onRate?.(star)}
            onMouseEnter={() => isInteractive && setHoveredRating(star)}
            onMouseLeave={() => isInteractive && setHoveredRating(0)}
            className={cn(
              isInteractive && 'cursor-pointer transform hover:scale-110 transition-transform',
              'focus:outline-none'
            )}
            disabled={!isInteractive}
          >
            <Star
              className={cn(
                'w-5 h-5',
                star <= (hoveredRating || rating)
                  ? 'fill-yellow-400 text-yellow-400'
                  : 'fill-gray-200 text-gray-200'
              )}
            />
          </button>
        ))}
      </div>
    );
  };

  return (
    <div className="min-h-screen py-20 px-4 relative overflow-hidden">
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        {[...Array(14)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 110 + 50,
              height: Math.random() * 110 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 3 === 0 
                ? 'hsl(220, 100%, 62%)' 
                : i % 3 === 1 
                  ? 'hsl(280, 100%, 65%)' 
                  : 'hsl(160, 100%, 45%)',
              filter: 'blur(65px)',
            }}
            animate={{
              y: [0, -45, 0],
              x: [0, 35, 0],
              scale: [1, 1.15, 1],
              opacity: [0.25, 0.5, 0.25],
            }}
            transition={{
              duration: 9 + Math.random() * 4,
              repeat: Infinity,
              delay: Math.random() * 2.5,
            }}
          />
        ))}
      </div>
      <div className="container mx-auto max-w-5xl relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-heading font-bold mb-6 gradient-text animate-gradient-shift" style={{ backgroundSize: '200% 200%' }}>Client Reviews</h1>
          <p className="text-xl font-body text-muted-foreground">
            See what some of my clients say about their experience working with me
          </p>
        </motion.div>

        {/* Reviews Display Section - Horizontal Scroll */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="mb-12"
        >
          {isLoading ? (
            <div className="flex gap-6 overflow-x-auto pb-4 scrollbar-hide">
              {[1, 2, 3, 4].map((i) => (
                <Card key={i} className="glass-effect p-6 animate-pulse min-w-[320px] flex-shrink-0">
                  <div className="h-4 bg-muted rounded w-1/4 mb-4"></div>
                  <div className="h-6 bg-muted rounded w-1/2 mb-4"></div>
                  <div className="h-24 bg-muted rounded mb-4"></div>
                  <div className="h-4 bg-muted rounded w-1/3"></div>
                </Card>
              ))}
            </div>
          ) : reviews.length > 0 ? (
            <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {reviews.map((review) => (
                <motion.div
                  key={review.id}
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3 }}
                  className="snap-start"
                >
                  <Card className="glass-effect p-6 hover:scale-105 transition-bounce cursor-pointer min-w-[320px] sm:min-w-[380px] flex-shrink-0">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-3">
                        {review.is_anonymous ? (
                          <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                            <User className="w-5 h-5 text-primary" />
                          </div>
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-primary to-purple-500 flex items-center justify-center text-white font-bold">
                            {review.name.charAt(0).toUpperCase()}
                          </div>
                        )}
                        <div>
                          <p className="font-body font-semibold">{review.name}</p>
                          {(review.role || review.company) && (
                            <p className="text-sm font-body text-primary">
                              {review.role}{review.role && review.company && ' at '}{review.company}
                            </p>
                          )}
                          <p className="text-xs font-body text-muted-foreground">
                            {review.project_type}
                          </p>
                        </div>
                      </div>
                      <StarRating rating={review.rating} />
                    </div>
                    <p className="font-body text-muted-foreground mb-4 line-clamp-4">
                      "{review.review}"
                    </p>
                    <p className="text-sm font-body text-muted-foreground/60">
                      {new Date(review.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                  </Card>
                </motion.div>
              ))}
            </div>
          ) : (
            <Card className="glass-effect p-12 text-center">
              <p className="text-xl font-body text-muted-foreground">
                No reviews yet. Be the first to share your experience!
              </p>
            </Card>
          )}
          {reviews.length > 0 && (
            <p className="text-center text-sm text-muted-foreground mt-4">
              ← Swipe to see more reviews →
            </p>
          )}
        </motion.div>

        {/* Submit Review Form Section */}
        <motion.div
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card className="glass-effect p-8">
            <h2 className="text-2xl font-heading font-bold mb-6">Share Your Experience</h2>
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="name" className="font-body">Name</Label>
                  <Input
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Your name (optional)"
                    className="mt-2"
                    disabled={formData.is_anonymous}
                  />
                </div>
                <div>
                  <Label htmlFor="project_type" className="font-body">Type of Project *</Label>
                  <Select
                    value={formData.project_type}
                    onValueChange={(value) => setFormData(prev => ({ ...prev, project_type: value }))}
                    required
                  >
                    <SelectTrigger className="mt-2">
                      <SelectValue placeholder="Select project type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Web Development">Web Development</SelectItem>
                      <SelectItem value="Branding & Design">Branding & Design</SelectItem>
                      <SelectItem value="Video & Photography">Video & Photography</SelectItem>
                      <SelectItem value="Creative Consulting">Creative Consulting</SelectItem>
                      <SelectItem value="Multiple Services">Multiple Services</SelectItem>
                      <SelectItem value="Other">Other</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div>
                  <Label htmlFor="company" className="font-body">Company / Business</Label>
                  <Input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleChange}
                    placeholder="Your company or business name"
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="role" className="font-body">Your Role</Label>
                  <Input
                    id="role"
                    name="role"
                    value={formData.role}
                    onChange={handleChange}
                    placeholder="e.g. CEO, Founder, Manager"
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label className="font-body mb-2 block">Rating *</Label>
                <StarRating 
                  rating={formData.rating} 
                  onRate={(rating) => setFormData(prev => ({ ...prev, rating }))}
                  isInteractive 
                />
                <p className="text-sm text-muted-foreground mt-2">
                  Click stars to rate your experience
                </p>
              </div>

              <div>
                <Label htmlFor="review" className="font-body">Your Review *</Label>
                <Textarea
                  id="review"
                  name="review"
                  value={formData.review}
                  onChange={handleChange}
                  required
                  rows={4}
                  placeholder="Tell me about your experience working together..."
                  className="mt-2"
                />
              </div>

              <div className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id="is_anonymous"
                  checked={formData.is_anonymous}
                  onChange={(e) => setFormData(prev => ({ ...prev, is_anonymous: e.target.checked }))}
                  className="rounded border-gray-300 text-primary focus:ring-primary"
                />
                <Label htmlFor="is_anonymous" className="font-body cursor-pointer">
                  Submit anonymously
                </Label>
              </div>

              <Button 
                type="submit" 
                size="lg" 
                className="w-full glow-ring"
                disabled={isSubmitting}
              >
                {isSubmitting ? 'Submitting...' : 'Submit Review'}
              </Button>
            </form>
          </Card>
        </motion.div>
      </div>
    </div>
  );
};

export default Reviews;