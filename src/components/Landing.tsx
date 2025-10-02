import React, { useState, useEffect } from 'react';
import PageContainer from './common/PageContainer';
import Header from './common/Header';
import Card from './common/Card';
import Button from './common/Button';
import Logo from './common/Logo';
import LoadingSpinner from './common/LoadingSpinner';

interface LandingProps {
  onNavigate?: (page: string) => void;
}

const Landing: React.FC<LandingProps> = ({ onNavigate }) => {
  const [animationPlayed, setAnimationPlayed] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Set animation as played after component mounts
    const timer = setTimeout(() => {
      setAnimationPlayed(true);
    }, 2000); // After animation completes

    return () => clearTimeout(timer);
  }, []);

  useEffect(() => {
    // Show loading for 2 seconds, then show content
    const loadingTimer = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    return () => clearTimeout(loadingTimer);
  }, []);

  const handleLoginClick = () => {
    if (onNavigate) {
      onNavigate('login');
    }
  };

  const handleSignUpClick = () => {
    if (onNavigate) {
      onNavigate('signup');
    }
  };

  if (isLoading) {
    return (
      <div style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        backgroundColor: '#f8f9fa',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 9999
      }}>
        <LoadingSpinner size="large" color="#e87500" />
      </div>
    );
  }

  return (
    <PageContainer>
      <div className="header-section">
        <Header
          title="Apollo"
          navItems={[]}
          currentPath=""
          onNavigate={onNavigate}
          showUserInfo={false}
          showAuthButtons={true}
          showMobileMenu={false}
          onLoginClick={handleLoginClick}
          onSignUpClick={handleSignUpClick}
        />
      </div>

      {/* Hero Section */}
      <div style={{ 
        textAlign: 'center', 
        padding: '3rem 0',
        backgroundColor: '#f8f9fa',
        marginBottom: '3rem',
        overflow: 'hidden'
      }}>
        <style>
          {`
            :root {
              --apollo-primary: #e87500;
              --apollo-secondary: #f49b90;
              --apollo-tertiary: #f28b7d;
              --apollo-quaternary: #f07a6a;
              --apollo-quinary: #ee6352;
            }

            @keyframes logoFlyIn {
              0% {
                transform: translate(200px, -200px) rotate(45deg);
                opacity: 0;
              }
              60% {
                transform: translate(-20px, 20px) rotate(-5deg);
                opacity: 1;
              }
              100% {
                transform: translate(0, 0) rotate(0deg);
                opacity: 1;
              }
            }
            
            @keyframes titleTrail {
              0% {
                transform: translate(300px, -150px) scale(0.5);
                opacity: 0;
              }
              30% {
                opacity: 0;
              }
              60% {
                transform: translate(-30px, 30px) scale(0.8);
                opacity: 0.7;
              }
              100% {
                transform: translate(0, 0) scale(1);
                opacity: 1;
              }
            }
            
            @keyframes bounce {
              0%, 20%, 50%, 80%, 100% {
                transform: translateY(0);
              }
              40% {
                transform: translateY(-10px);
              }
              60% {
                transform: translateY(-5px);
              }
            }

            @keyframes apolloShadows {
              0% {
                text-shadow: none;
              }
              10% {
                transform: translate(-3px, -3px);
                text-shadow: 3px 3px 0 var(--apollo-secondary);
              }
              20% {
                transform: translate(-6px, -6px);
                text-shadow: 3px 3px 0 var(--apollo-secondary),
                  6px 6px 0 var(--apollo-tertiary);
              }
              30% {
                transform: translate(-9px, -9px);
                text-shadow: 3px 3px 0 var(--apollo-secondary),
                  6px 6px 0 var(--apollo-tertiary), 9px 9px var(--apollo-quaternary);
              }
              40% {
                transform: translate(-12px, -12px);
                text-shadow: 3px 3px 0 var(--apollo-secondary),
                  6px 6px 0 var(--apollo-tertiary), 9px 9px var(--apollo-quaternary),
                  12px 12px 0 var(--apollo-quinary);
              }
              50% {
                transform: translate(-12px, -12px);
                text-shadow: 3px 3px 0 var(--apollo-secondary),
                  6px 6px 0 var(--apollo-tertiary), 9px 9px var(--apollo-quaternary),
                  12px 12px 0 var(--apollo-quinary);
              }
              60% {
                text-shadow: 3px 3px 0 var(--apollo-secondary),
                  6px 6px 0 var(--apollo-tertiary), 9px 9px var(--apollo-quaternary),
                  12px 12px 0 var(--apollo-quinary);
              }
              70% {
                text-shadow: 3px 3px 0 var(--apollo-secondary),
                  6px 6px 0 var(--apollo-tertiary), 9px 9px var(--apollo-quaternary);
              }
              80% {
                text-shadow: 3px 3px 0 var(--apollo-secondary),
                  6px 6px 0 var(--apollo-tertiary);
              }
              90% {
                text-shadow: 3px 3px 0 var(--apollo-secondary);
              }
              100% {
                text-shadow: none;
              }
            }
            
            .hero-logo {
              animation: logoFlyIn 1.5s ease-out forwards;
              animation-fill-mode: forwards;
            }
            
            .hero-logo.animation-complete {
              animation: none;
              transform: translate(0, 0) rotate(0deg);
              opacity: 1;
            }
            
            .hero-title {
              animation: titleTrail 1.8s ease-out 0.3s forwards;
              opacity: 0;
            }
            
            .hero-logo:hover {
              animation: bounce 0.6s ease-in-out;
            }

            .apollo-text {
              color: var(--apollo-primary);
              font-weight: 800;
              font-size: 6rem;
              animation: apolloShadows 3s ease-in infinite;
              letter-spacing: 0.2rem;
              display: block;
              margin: 0;
            }

            @keyframes fadeInUp {
              0% {
                opacity: 0;
                transform: translateY(30px);
              }
              100% {
                opacity: 1;
                transform: translateY(0);
              }
            }

            .about-section {
              animation: fadeInUp 1s ease-out 2s forwards;
              opacity: 0;
            }

            .apollo-platform-section {
              animation: fadeInUp 1s ease-out 1.5s forwards;
              opacity: 0;
            }

            .welcome-text {
              animation: fadeInUp 1s ease-out 0.5s forwards;
              opacity: 0;
            }

            .header-section {
              animation: fadeInUp 1s ease-out 1s forwards;
              opacity: 0;
            }
          `}
        </style>
        <div style={{ marginBottom: '2rem', position: 'relative', overflow: 'hidden', height: 'min(400px, 60vh)', display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
          <style>
            {`
              @keyframes orbit {
                0% {
                  transform: rotate(0deg) translateX(min(180px, 30vw)) rotate(0deg);
                }
                100% {
                  transform: rotate(360deg) translateX(min(180px, 30vw)) rotate(-360deg);
                }
              }
              
              @keyframes orbitReverse {
                0% {
                  transform: rotate(0deg) translateX(min(160px, 25vw)) rotate(0deg);
                }
                100% {
                  transform: rotate(-360deg) translateX(min(160px, 25vw)) rotate(360deg);
                }
              }
              
              @keyframes orbitSlow {
                0% {
                  transform: rotate(0deg) translateX(min(200px, 35vw)) rotate(0deg);
                }
                100% {
                  transform: rotate(360deg) translateX(min(200px, 35vw)) rotate(-360deg);
                }
              }
              
              .orbiting-ball {
                position: absolute;
                width: 10px;
                height: 10px;
                border-radius: 50%;
                top: 50%;
                left: 50%;
                transform-origin: 0 0;
                z-index: 1;
              }
              
              .orbiting-ball:nth-child(1) {
                animation: orbit 15s linear infinite;
                background: #e87500;
              }
              
              .orbiting-ball:nth-child(2) {
                animation: orbitReverse 18s linear infinite;
                background: #154734;
              }
              
              .orbiting-ball:nth-child(3) {
                animation: orbitSlow 20s linear infinite;
                background: #f49b90;
              }
              
              .orbiting-ball:nth-child(4) {
                animation: orbit 12s linear infinite;
                background: #f28b7d;
              }
            `}
          </style>
          <div className="orbiting-ball"></div>
          <div className="orbiting-ball"></div>
          <div className="orbiting-ball"></div>
          <div className="orbiting-ball"></div>
          <h2 className="welcome-text" style={{ 
            fontSize: '2rem', 
            color: '#154734', 
            marginBottom: '1rem',
            fontWeight: '400',
            textAlign: 'center',
            position: 'relative',
            zIndex: 2
          }}>
            Welcome to
          </h2>
          <h1 className="apollo-text" style={{ 
            margin: 0,
            lineHeight: '1.2',
            marginLeft: '1rem',
            position: 'relative',
            zIndex: 2
          }}>
            Apollo
          </h1>
        </div>
      </div>

      {/* Apollo Platform Section */}
      <div className="apollo-platform-section">
        <Card
          title="Apollo Platform"
          style={{ marginBottom: '2rem' }}
        >
          <div style={{ lineHeight: '1.6', fontSize: '1rem' }}>
            <p style={{ marginBottom: '1rem' }}>
              Apollo is our custom-built management platform, created by the UGDC council 
              in 2025. This comprehensive system streamlines our operations, from member 
              management and volunteer coordination to attendance tracking and communication.
            </p>
            <p style={{ marginBottom: '1rem' }}>
              With Apollo, UGDC members can easily access member directories, track volunteer 
              activities, manage their profiles, and stay connected with the organization's 
              activities and initiatives.
            </p>
          </div>
        </Card>
      </div>

      {/* About UGDC Section */}
      <div className="about-section">
        <Card
          title="About the Undergraduate Dean's Council"
          style={{ marginBottom: '2rem' }}
        >
        <div style={{ lineHeight: '1.6', fontSize: '1rem' }}>
          <p style={{ marginBottom: '1.5rem' }}>
            The Undergraduate Dean's Council (UGDC) is a student governance organization 
            dedicated to representing the interests of undergraduate students and fostering 
            academic excellence within our institution. Established to bridge the gap between 
            students and administration, the UGDC plays a crucial role in shaping policies 
            that directly impact the undergraduate experience.
          </p>
          
          <h3 style={{ color: '#154734', marginBottom: '1rem', fontSize: '1.25rem' }}>
            Our Mission
          </h3>
          <p style={{ marginBottom: '1.5rem' }}>
            To serve as the primary voice for undergraduate students, advocating for their 
            needs and interests while promoting academic success, student engagement, and 
            institutional improvement. We strive to create a collaborative environment where 
            student perspectives are valued and integrated into decision-making processes.
          </p>

          <h3 style={{ color: '#154734', marginBottom: '1rem', fontSize: '1.25rem' }}>
            Key Responsibilities
          </h3>
          <div style={{ marginBottom: '1.5rem' }}>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Student Advocacy:</strong> Representing undergraduate student interests in academic and administrative matters
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Policy Development:</strong> Contributing to the development of policies affecting undergraduate education
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Community Engagement:</strong> Organizing events and initiatives that strengthen the undergraduate community
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Academic Support:</strong> Providing resources and support for student academic success
            </div>
            <div style={{ marginBottom: '0.5rem' }}>
              <strong>Leadership Development:</strong> Fostering leadership skills and civic engagement among students
            </div>
          </div>


           <div style={{ 
             backgroundColor: '#e8f5e8', 
             padding: '1.5rem', 
             borderRadius: '8px', 
             border: '1px solid #c3e6cb',
           }}>
            <h4 style={{ color: '#155724', marginBottom: '1rem', fontSize: '1.1rem', marginTop: '-0.5rem' }}>
              Join the UGDC Community
            </h4>
            <p style={{ margin: 0, color: '#155724', marginBottom: '1rem' }}>
              Ready to make a difference in the undergraduate experience? Join the Undergraduate 
              Dean's Council and become part of a dedicated team working to improve student life 
              and academic success.
            </p>
            <p style={{ margin: 0, color: '#155724' }}>
              <a 
                href="https://jindal.utdallas.edu/student-resources/deans-council/undergraduate/" 
                target="_blank" 
                rel="noopener noreferrer"
                style={{ 
                  color: '#155724', 
                  textDecoration: 'underline',
                  fontWeight: '500'
                }}
              >
                Learn more about the Undergraduate Dean's Council →
              </a>
            </p>
          </div>
        </div>
        </Card>
      </div>

    </PageContainer>
  );
};

export default Landing;
