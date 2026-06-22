import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, Activity, Shield, BarChart3, ClipboardList, HeartPulse } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ROUTES } from '@/routes/routes';
import { useInView } from '@/hooks/useInView';

type HealthStatus = 'idle' | 'checking' | 'online' | 'offline';

interface Feature {
  icon: React.ReactNode;
  title: string;
  description: string;
}

function FeaturesSection({
  isHovered, setIsHovered, features,
}: {
  isHovered: string | null;
  setIsHovered: (v: string | null) => void;
  features: Feature[];
}) {
  const { ref, inView } = useInView();
  return (
    <div className="py-12 px-4" ref={ref}>
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-4 drop-shadow-lg">Powerful Features</h2>
          <p className="text-xl text-gray-800 dark:text-gray-200 drop-shadow-lg">Everything you need to run operations efficiently</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card
              key={index}
              style={{ transitionDelay: `${index * 120}ms` }}
              className={`transform transition-all duration-500 hover:scale-105 cursor-pointer backdrop-blur-md border-white/20 bg-white/80 dark:!bg-white/5 ${
                inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
              } ${
                isHovered === `feature-${index}` ? 'shadow-2xl' : 'shadow-lg hover:shadow-xl'
              }`}
              onMouseEnter={() => setIsHovered(`feature-${index}`)}
              onMouseLeave={() => setIsHovered(null)}
            >
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 p-3 bg-white/20 backdrop-blur-sm rounded-full w-16 h-16 flex items-center justify-center">
                  {feature.icon}
                </div>
                <CardTitle className="text-xl text-gray-900 dark:text-white">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent className="text-center">
                <CardDescription className="text-gray-800 dark:text-gray-200 text-base">{feature.description}</CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}

function QuickActionsSection({
  isHovered, setIsHovered,
}: {
  isHovered: string | null;
  setIsHovered: (v: string | null) => void;
}) {
  const { ref, inView } = useInView();
  return (
    <div className="py-12 px-4" ref={ref}>
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl font-bold text-gray-900 dark:text-white mb-8 drop-shadow-lg">Get Started</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 items-stretch">
          {[
            {
              key: 'orders',
              to: ROUTES.ORDERS,
              icon: <ClipboardList className="w-16 h-16 text-primary mx-auto mb-4" />,
              title: 'Orders',
              desc: 'Browse, search, and manage all customer orders, using our Flow Order App',
              action: <Button variant="outline" className="bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white hover:bg-transparent dark:hover:bg-transparent hover:text-gray-900 dark:hover:text-white backdrop-blur-sm">View Orders</Button>,
              delay: 0,
            },
            {
              key: 'dashboard',
              to: ROUTES.DASHBOARD,
              icon: <BarChart3 className="w-16 h-16 text-primary mx-auto mb-4" />,
              title: 'Dashboard',
              desc: 'Monitor metrics, fulfilment rates, and operations at a glance',
              action: <Button>View Dashboard</Button>,
              delay: 120,
            },
          ].map((item) => (
            <Link key={item.key} to={item.to} className="flex">
              <Card
                style={{ transitionDelay: `${item.delay}ms` }}
                className={`flex flex-col w-full transform transition-all duration-500 hover:scale-105 cursor-pointer backdrop-blur-md border-white/20 bg-white/80 dark:!bg-white/5 ${
                  inView ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'
                } ${
                  isHovered === item.key ? 'shadow-2xl' : 'shadow-lg hover:shadow-xl'
                }`}
                onMouseEnter={() => setIsHovered(item.key)}
                onMouseLeave={() => setIsHovered(null)}
              >
                <CardContent className="flex flex-col flex-1 p-8 text-center">
                  {item.icon}
                  <h3 className="text-2xl font-bold text-gray-900 dark:text-white mb-3">{item.title}</h3>
                  <p className="text-gray-800 dark:text-gray-200 mb-6 flex-1">{item.desc}</p>
                  <div>{item.action}</div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

export function LandingPage() {
  const [isHovered, setIsHovered] = useState<string | null>(null);
  const [healthStatus, setHealthStatus] = useState<HealthStatus>('idle');

  async function checkHealth() {
    setHealthStatus('checking');
    try {
      const res = await fetch('/health');
      setHealthStatus(res.ok ? 'online' : 'offline');
    } catch {
      setHealthStatus('offline');
    }
  }

  const features = [
    {
      icon: <Package className="w-8 h-8 text-primary" />,
      title: 'Order Management',
      description: 'Create, update, and track orders through every stage of fulfilment',
    },
    {
      icon: <Activity className="w-8 h-8 text-primary" />,
      title: 'Real-Time Tracking',
      description: 'Monitor status transitions and fulfilment progress live',
    },
    {
      icon: <Shield className="w-8 h-8 text-primary" />,
      title: 'Status Transitions',
      description: 'Enforced order lifecycle — pending, paid, shipped, and cancelled with validated transitions',
    },
  ];

  return (
    <div>
      {/* Hero */}
      <div className="text-center py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <img src="/logo.png" alt="OrderFlow" className="h-16 object-contain mx-auto mb-6" />
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 dark:text-white mb-6 drop-shadow-lg">
            Internal Order Management System
          </h1>
          <p className="text-xl md:text-2xl text-gray-800 dark:text-gray-200 mb-10 max-w-3xl mx-auto drop-shadow-lg">
            Manage customer orders, track status transitions, and monitor fulfilment in real time — all from one place.
          </p>
          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link to={ROUTES.LOGIN}>
              <Button size="lg" className="text-lg px-8 py-4 transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl">
                Sign In
              </Button>
            </Link>
            <Link to={ROUTES.DASHBOARD}>
              <Button
                variant="outline" size="lg"
                className="text-lg px-8 py-4 border-2 bg-gray-900 dark:bg-white text-white dark:text-gray-900 border-gray-900 dark:border-white hover:bg-transparent dark:hover:bg-transparent hover:text-gray-900 dark:hover:text-white transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl backdrop-blur-sm"
              >
                <BarChart3 className="w-6 h-6 mr-3" />
                Dashboard
              </Button>
            </Link>
            <Button
              variant="outline" size="lg"
              onClick={checkHealth}
              disabled={healthStatus === 'checking'}
              className="text-lg px-8 py-4 border-2 backdrop-blur-sm transform hover:scale-105 transition-all duration-200 shadow-lg hover:shadow-xl"
            >
              <HeartPulse className="w-6 h-6 mr-3" />
              {healthStatus === 'checking' && 'Checking...'}
              {healthStatus === 'idle' && 'Check API Health'}
              {healthStatus === 'online' && <span className="text-green-500">API Online</span>}
              {healthStatus === 'offline' && <span className="text-red-500">API Offline</span>}
            </Button>
          </div>
        </div>
      </div>

      {/* Features */}
      <FeaturesSection isHovered={isHovered} setIsHovered={setIsHovered} features={features} />

      {/* Quick Actions */}
      <QuickActionsSection isHovered={isHovered} setIsHovered={setIsHovered} />
    </div>
  );
}
