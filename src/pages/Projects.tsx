import { motion } from 'framer-motion';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ExternalLink, Github, Eye, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useState } from 'react';

// Import project images
import project1 from '@/assets/project_1.jpg';
import project2 from '@/assets/project_2.jpg';
import project3 from '@/assets/project_3.jpg';
import project4 from '@/assets/project_4.jpg';
import project5 from '@/assets/project_5.jpg';
import project6 from '@/assets/project_6.jpg';
import project7 from '@/assets/project_7.jpg';
import project8 from '@/assets/project_8.jpg';

type Project = {
  title: string;
  category: string;
  subcategory?: string;
  description: string;
  stack: string[];
  type: 'web' | 'graphics' | 'video' | string;
  year: string;
  live?: string;
  github?: string;
  image?: string;
};

const projects: Project[] = [
  {
    title: 'edu.ai App',
    category: 'Web Application',
    subcategory: 'Startup (In Progress)',
    description: 'Personalized AI tutoring for preparations of exams like: WAEC, JAMB, NECO, and university courses. Study smarter with AI-powered explanations, practice questions, and analytics.',
    stack: ['TypeScript', 'CSS', 'PLpgSQL', 'Supabase',],
    type: 'web',
    year: '2025',
    github: 'https://github.com/toluwanibakare/edu-ai-app',
    live: 'https://eduai-app.netlify.app/',
    image: project1
  },
  {
    title: 'Krea-AI Landing Page Clone',
    category: 'Web Development',
    subcategory: 'Personal',
    description: "A clone of Krea AI's home page.",
    stack: ['TypeScript', 'JavaScript', 'CSS', 'Next.js'],
    type: 'web',
    year: '2025',
    github: 'https://github.com/toluwanibakare/KreaAI-clone',
    live: 'https://krea-aiclone.netlify.app/',
    image: project2
  },
  {
    title: 'Weather App',
    category: 'Web Development',
    subcategory: 'Personal',
    description: 'A responsive weather app with search functionality, unit conversion and location tracker.',
    stack: ['HTML', 'JavaScript', 'CSS', 'Open-Meteo API'],
    type: 'web',
    year: '2025',
    github: 'https://github.com/toluwanibakare/Weather-app',
    live: 'https://universal-weather-forcast.netlify.app/',
    image: project3
  },
  {
    title: 'Certificate Generator',
    category: 'Web Development',
    subcategory: 'Client',
    description: 'Automatic Certificate Generator for WIPS using names inputed by the user.',
    stack: ['Next.js', 'TailwindCSS', 'Canva'],
    type: 'web',
    year: '2024',
    github: 'https://github.com/toluwanibakare/WIPS-Certificate-Generator',
    live: 'https://wips-certificate-generator.vercel.app/',
    image: project4
  },
  {
    title: 'OAK Global Business Website',
    category: 'Web Development',
    subcategory: 'Client',
    description: 'Responsive website for OAK Global International Solutions Ltd, showcasing their services and contact information.',
    stack: ['HTML', 'TailwindCSS', 'JavaScript', 'Node Js', 'MySql'],
    type: 'web',
    year: '2025',
    github: 'https://github.com/toluwanibakare/oak-global',
    live: 'https://oak-gloabal.com.ng/',
    image: project5
  },
  {
    title: 'IBMSSP Business Website',
    category: 'Web Development',
    subcategory: 'Client',
    description: 'Showcase services and resources for IBMSSP and basically about the company as well.',
    stack: ['Wordpress', 'Elementor'],
    type: 'web',
    year: '2025',
    live: 'https://ibmssp.org.ng/',
    image: project6
  },
  {
    title: 'Interior Design Website ',
    category: 'Web Development',
    subcategory: 'Client',
    description: 'Fully built website for an interior design brand showcasing services and portfolio.',
    stack: ['HTML', 'TailwindCSS', 'JavaScript', 'TypeScript', 'MySql', 'Node Js'],
    type: 'web',
    year: '2026',
    github: 'https://github.com/toluwanibakare/ademaison',
    live: 'https://ademaisoninteriors.com',
    image: project7
  },
  {
    title: 'Windows 7 Calculator Clone',
    category: 'Web Development',
    subcategory: 'Personal',
    description: 'My Web version of Windows 7 Calculator. One of my earliest projects.',
    stack: ['HTMl', 'CSS', 'JavaScript'],
    type: 'web',
    year: '2021',
    github: 'https://github.com/toluwanibakare/Win-7-calculator-clone',
    live: 'https://win-7-calc-clone.netlify.app/',
    image: project8
  },
  {
    title: 'Church Brand Identity',
    category: 'Brand Design',
    description: 'Complete branding package including logo, materials, and social media assets',
    stack: ['Photoshop', 'Illustrator', 'Figma'],
    type: 'graphics',
    year: '2024',
  },
  {
    title: 'Product Launch Video',
    category: 'Video Production',
    description: 'High quality promotional video with motion graphics and professional editing',
    stack: ['Premiere Pro', 'After Effects', 'DaVinci Resolve'],
    type: 'video',
    year: '2024',
  },
];

const Projects = () => {
  const webProjects = projects.filter(p => p.type === 'web');
  const graphicsProjects = projects.filter(p => p.type === 'graphics');
  const videoProjects = projects.filter(p => p.type === 'video');
  const [flippedCard, setFlippedCard] = useState<number | null>(null);
  const [fullscreenImage, setFullscreenImage] = useState<string | null>(null);

  const handleCardClick = (index: number) => {
    setFlippedCard(flippedCard === index ? null : index);
  };

  const handlePreviewClick = (imageUrl: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFullscreenImage(imageUrl);
  };

  const renderProjectCard = (project: typeof projects[0], index: number) => {
    const previewImage = project.image;
    const isFlipped = flippedCard === index;

    return (
      <motion.div
        key={index}
        initial={{ opacity: 0, y: 40 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ delay: index * 0.1 }}
        viewport={{ once: true }}
        className="perspective-1000"
      >
        <div className="relative min-h-[580px]">
          <motion.div
            className="absolute inset-0 w-full h-full cursor-pointer"
            animate={{ rotateY: isFlipped ? 180 : 0 }}
            transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
            onClick={() => handleCardClick(index)}
            style={{ transformStyle: 'preserve-3d' }}
          >
            {/* Front of Card - Tap to Preview */}
            <div
              className="absolute inset-0 w-full h-full backface-hidden"
              style={{ backfaceVisibility: 'hidden' }}
            >
              <Card className="glass-effect overflow-hidden h-full flex flex-col hover:glow-ring transition-bounce group">
                <div className="relative h-64 overflow-hidden bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20">
                  <div className="w-full h-full flex flex-col items-center justify-center p-4 text-center">
                    <div className="relative">
                      <div className="w-20 h-20 rounded-full bg-gradient-to-br from-primary/30 via-secondary/30 to-accent/30 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                        <Eye className="w-10 h-10 text-primary" />
                      </div>
                      <div className="absolute inset-0 rounded-full border-2 border-dashed border-primary/30 animate-spin-slow" />
                    </div>
                    <p className="text-sm font-body text-primary font-semibold uppercase tracking-wider">
                      Tap to Preview
                    </p>
                    <p className="text-xs font-body text-muted-foreground mt-2">
                      Click to see project screenshot
                    </p>
                  </div>
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap mb-2">
                      <span className="text-xs font-body text-primary font-semibold uppercase">
                        {project.category}
                      </span>
                      {project.subcategory && (
                        <span className="text-xs font-body px-2 py-1 rounded-full bg-secondary/20 text-secondary-foreground">
                          {project.subcategory}
                        </span>
                      )}
                      <span className="text-xs font-body px-2 py-1 rounded-full bg-muted text-muted-foreground">
                        {project.year}
                      </span>
                    </div>
                    <h3 className="text-2xl font-heading font-semibold mt-2 mb-3">
                      {project.title}
                    </h3>
                    <p className="font-body text-muted-foreground mb-4 line-clamp-3">
                      {project.description}
                    </p>
                    <div className="flex flex-wrap gap-2 mb-4">
                      {project.stack.map((tech) => (
                        <span
                          key={tech}
                          className="text-xs font-body px-3 py-1 bg-primary/10 text-primary rounded-full"
                        >
                          {tech}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button asChild size="sm" variant="outline" className="flex-1" onClick={(e) => e.stopPropagation()}>
                      <a
                        href={project.live || '#'}
                        target={project.live ? '_blank' : undefined}
                        rel={project.live ? 'noopener noreferrer' : undefined}
                      >
                        <ExternalLink className="mr-2" size={14} />
                        View Live
                      </a>
                    </Button>
                    {project.type === 'web' && project.github && (
                      <Button asChild size="sm" variant="outline" onClick={(e) => e.stopPropagation()}>
                        <a href={project.github} target="_blank" rel="noopener noreferrer">
                          <Github size={14} />
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </Card>
            </div>

            {/* Back of Card - Project Image */}
            <div
              className="absolute inset-0 w-full h-full backface-hidden"
              style={{ backfaceVisibility: 'hidden', transform: 'rotateY(180deg)' }}
            >
              <Card className="glass-effect overflow-hidden h-full flex flex-col hover:glow-ring transition-bounce">
                <div 
                  className="relative h-64 overflow-hidden cursor-pointer"
                  onClick={(e) => previewImage && handlePreviewClick(previewImage, e)}
                >
                  {previewImage ? (
                    <>
                      <img 
                        src={previewImage} 
                        alt={`${project.title} Preview`}
                        className="w-full h-full object-cover"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-background/60 to-transparent opacity-0 hover:opacity-100 transition-opacity duration-300 flex items-end justify-center pb-4">
                        <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full">
                          <Eye className="w-4 h-4 text-primary" />
                          <span className="text-sm font-body text-primary font-semibold">Click to enlarge</span>
                        </div>
                      </div>
                    </>
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 via-secondary/20 to-accent/20">
                      <p className="text-muted-foreground">No preview available</p>
                    </div>
                  )}
                </div>
                
                <div className="p-6 flex-1 flex flex-col">
                  <h3 className="text-2xl font-heading font-semibold mb-2">
                    {project.title}
                  </h3>
                  <p className="text-sm font-body text-muted-foreground mb-4">
                    Project Preview
                  </p>
                  <div className="flex-1" />
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation();
                      setFlippedCard(null);
                    }}
                    className="w-full"
                  >
                    Back to Details
                  </Button>
                </div>
              </Card>
            </div>
          </motion.div>
        </div>
      </motion.div>
    );
  };

  return (
    <div className="min-h-screen py-20 px-4 relative overflow-hidden">
      {/* Fullscreen Image Modal */}
      {fullscreenImage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/95 backdrop-blur-sm"
          onClick={() => setFullscreenImage(null)}
        >
          <div className="relative max-w-7xl max-h-[90vh] w-full mx-4">
            <Button
              size="icon"
              variant="outline"
              className="absolute top-4 right-4 z-10 rounded-full bg-background/80 backdrop-blur-sm"
              onClick={() => setFullscreenImage(null)}
            >
              <X className="w-4 h-4" />
            </Button>
            <img
              src={fullscreenImage}
              alt="Fullscreen Preview"
              className="w-full h-full object-contain rounded-lg shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            />
            <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full">
              <p className="text-sm font-body text-foreground">
                Click anywhere to close
              </p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Background Animation */}
      <div className="absolute inset-0 opacity-20 pointer-events-none">
        {[...Array(18)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute rounded-full"
            style={{
              width: Math.random() * 100 + 40,
              height: Math.random() * 100 + 40,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              background: i % 3 === 0 
                ? 'hsl(220, 100%, 62%)' 
                : i % 3 === 1 
                  ? 'hsl(280, 100%, 65%)' 
                  : 'hsl(160, 100%, 45%)',
              filter: 'blur(60px)',
            }}
            animate={{
              y: [0, -60, 0],
              x: [0, 50, 0],
              opacity: [0.2, 0.5, 0.2],
            }}
            transition={{
              duration: 10 + Math.random() * 5,
              repeat: Infinity,
              delay: Math.random() * 2,
            }}
          />
        ))}
      </div>
      
      <div className="container mx-auto relative z-10">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center mb-16"
        >
          <h1 className="text-5xl font-heading font-bold mb-6 gradient-text animate-gradient-shift" style={{ backgroundSize: '200% 200%' }}>
            My Projects
          </h1>
          <p className="text-xl font-body text-muted-foreground mb-4">
            Here are some web applications and websites I built showcasing modern design and functionality either for fun or other clients
          </p>
          <p className="text-sm font-body text-primary">
            Tap any card to see the project preview
          </p>
        </motion.div>

        {/* Web Development Projects */}
        <div className="mb-20">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {webProjects.map((project, index) => renderProjectCard(project, index))}
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center glass-effect p-12 rounded-2xl"
        >
          <h2 className="text-3xl font-heading font-bold mb-4">
            Have a project in mind?
          </h2>
          <p className="font-body text-muted-foreground mb-6">
            Let us build it together
          </p>
          <Link to="/contact">
            <Button size="lg" className="glow-ring">
              Start a Project
            </Button>
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default Projects;