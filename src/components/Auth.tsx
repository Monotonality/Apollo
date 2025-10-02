import React, { useState } from 'react';
import { signIn, createUser } from '../services/authService';
import { CreateUserData } from '../types/user';
import { PageContainer, Header, Card, Input, Button, LoadingSpinner } from './common';
import { getIconProps } from '../utils/assets';

interface AuthProps {
  onAuthSuccess: () => void;
}

const Auth: React.FC<AuthProps> = ({ onAuthSuccess }) => {
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  
  // Sign in form state
  const [signInEmail, setSignInEmail] = useState('');
  const [signInPassword, setSignInPassword] = useState('');
  
  // Sign up form state
  const [signUpData, setSignUpData] = useState<CreateUserData>({
    email: '',
    password: '',
    firstName: '',
    lastName: ''
  });

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Validate and sanitize sign-in inputs only on submission
    const sanitizedEmail = sanitizeInput(signInEmail);
    const sanitizedPassword = sanitizeInput(signInPassword);

    if (!validateEmail(sanitizedEmail)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (!validatePassword(sanitizedPassword)) {
      setError('Invalid password format');
      setLoading(false);
      return;
    }

    try {
      await signIn(sanitizedEmail, sanitizedPassword);
      onAuthSuccess();
    } catch (error: any) {
      setError(error.message || 'Sign in failed');
    } finally {
      setLoading(false);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    // Final validation before submission
    if (!validateEmail(signUpData.email)) {
      setError('Please enter a valid email address');
      setLoading(false);
      return;
    }

    if (!validateName(signUpData.firstName) || !validateName(signUpData.lastName)) {
      setError('Names can only contain letters, spaces, hyphens, and apostrophes');
      setLoading(false);
      return;
    }

    if (!validatePassword(signUpData.password)) {
      setError('Password must be 6-128 characters and cannot contain dangerous patterns');
      setLoading(false);
      return;
    }

    // Sanitize all data before sending
    const sanitizedData = {
      ...signUpData,
      email: sanitizeInput(signUpData.email).toLowerCase(),
      firstName: sanitizeInput(signUpData.firstName),
      lastName: sanitizeInput(signUpData.lastName),
      password: signUpData.password // Password is already validated
    };

    try {
      await createUser(sanitizedData);
      onAuthSuccess();
    } catch (error: any) {
      setError(error.message || 'Sign up failed');
    } finally {
      setLoading(false);
    }
  };

  // Input sanitization and validation
  const sanitizeInput = (input: string): string => {
    // Remove potentially dangerous characters and patterns
    return input
      .replace(/[<>\"'%;()&+]/g, '') // Remove HTML/script injection characters
      .replace(/javascript:/gi, '') // Remove javascript: protocol
      .replace(/data:/gi, '') // Remove data: protocol
      .replace(/vbscript:/gi, '') // Remove vbscript: protocol
      .trim(); // Remove leading/trailing whitespace
  };

  const validateEmail = (email: string): boolean => {
    // Basic email validation with injection protection
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email) && email.length <= 254; // RFC 5321 limit
  };

  const validateName = (name: string): boolean => {
    // Allow only letters, spaces, hyphens, and apostrophes
    const nameRegex = /^[a-zA-Z\s\-']{1,50}$/;
    return nameRegex.test(name);
  };

  const validatePassword = (password: string): boolean => {
    // Password validation with injection protection
    if (password.length < 6 || password.length > 128) return false;
    
    // Check for dangerous patterns
    const dangerousPatterns = [
      /javascript:/gi,
      /data:/gi,
      /vbscript:/gi,
      /<script/gi,
      /<iframe/gi,
      /<object/gi,
      /<embed/gi
    ];
    
    return !dangerousPatterns.some(pattern => pattern.test(password));
  };

  const handleSignUpDataChange = (field: keyof CreateUserData, value: string | number) => {
    let processedValue = value;
    
    if (typeof value === 'string') {
      // Apply field-specific processing (but don't sanitize during typing)
      if (field === 'firstName' || field === 'lastName') {
        // Only capitalize, don't validate during typing
        if (value.length > 0) {
          processedValue = value.charAt(0).toUpperCase() + value.slice(1).toLowerCase();
        }
      } else if (field === 'email') {
        // Convert to lowercase for email
        processedValue = value.toLowerCase();
      }
      // For password, just store the value as-is during typing
    }
    
    // Clear any existing errors
    if (error) setError(null);
    
    setSignUpData(prev => ({
      ...prev,
      [field]: processedValue
    }));
  };

  const calculatePasswordStrength = (password: string) => {
    let score = 0;
    let feedback = '';

    // Length check
    if (password.length >= 8) score += 1;
    if (password.length >= 12) score += 1;
    
    // Character variety checks
    if (/[a-z]/.test(password)) score += 1;
    if (/[A-Z]/.test(password)) score += 1;
    if (/[0-9]/.test(password)) score += 1;
    if (/[^A-Za-z0-9]/.test(password)) score += 1;

    // Determine strength level
    if (score <= 2) {
      return { strength: 'weak', color: '#dc3545', feedback: 'Weak password' };
    } else if (score <= 4) {
      return { strength: 'medium', color: '#e87500', feedback: 'Medium password' };
    } else {
      return { strength: 'strong', color: '#198754', feedback: 'Strong password' };
    }
  };

  const getPasswordStrengthBar = () => {
    if (!signUpData.password) return null;
    
    const { strength, color, feedback } = calculatePasswordStrength(signUpData.password);
    const width = strength === 'weak' ? '33%' : strength === 'medium' ? '66%' : '100%';
    
    return (
      <div style={{ marginTop: '0.5rem' }}>
        <div style={{
          width: '100%',
          height: '4px',
          backgroundColor: '#e0e0e0',
          borderRadius: '2px',
          overflow: 'hidden'
        }}>
          <div style={{
            width: width,
            height: '100%',
            backgroundColor: color,
            transition: 'all 0.3s ease'
          }} />
        </div>
        <div style={{
          fontSize: '0.8rem',
          color: color,
          marginTop: '0.25rem',
          fontWeight: '500'
        }}>
          {feedback}
        </div>
      </div>
    );
  };

  return (
    <PageContainer style={{ 
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh'
    }}>
      <div style={{ maxWidth: '400px', width: '100%' }}>
        <Card
          title={isSignUp ? 'Create Account' : 'Sign In'}
          style={{ textAlign: 'center' }}
        >
          {error && (
            <div style={{ 
              color: '#dc3545', 
              marginBottom: '1rem', 
              padding: '0.5rem',
              backgroundColor: '#f8d7da',
              border: '1px solid #f5c6cb',
              borderRadius: '4px'
            }}>
              {error}
            </div>
          )}

      {!isSignUp ? (
        <form onSubmit={handleSignIn}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Email:
            </label>
            <input
              type="email"
              value={signInEmail}
              onChange={(e) => setSignInEmail(e.target.value)}
              required
              maxLength={254}
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Password:
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={signInPassword}
                onChange={(e) => setSignInPassword(e.target.value)}
                required
                maxLength={128}
                minLength={6}
                autoComplete="current-password"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  paddingRight: '2.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <img 
                  {...getIconProps(showPassword ? 'eyeSlash' : 'eye', 16)}
                  style={{ opacity: 0.6 }}
                />
              </button>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#e87500',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Signing In...' : 'Sign In'}
          </button>
        </form>
      ) : (
        <form onSubmit={handleSignUp}>
          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Email:
            </label>
            <input
              type="email"
              value={signUpData.email}
              onChange={(e) => handleSignUpDataChange('email', e.target.value)}
              required
              maxLength={254}
              autoComplete="email"
              autoCapitalize="none"
              autoCorrect="off"
              spellCheck="false"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Password:
            </label>
            <div style={{ position: 'relative' }}>
              <input
                type={showPassword ? 'text' : 'password'}
                value={signUpData.password}
                onChange={(e) => handleSignUpDataChange('password', e.target.value)}
                required
                maxLength={128}
                minLength={6}
                autoComplete="new-password"
                autoCapitalize="none"
                autoCorrect="off"
                spellCheck="false"
                style={{
                  width: '100%',
                  padding: '0.5rem',
                  paddingRight: '2.5rem',
                  border: '1px solid #ddd',
                  borderRadius: '4px',
                  fontSize: '1rem'
                }}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: 'absolute',
                  right: '0.75rem',
                  top: '50%',
                  transform: 'translateY(-50%)',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '0.25rem',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                <img 
                  {...getIconProps(showPassword ? 'eyeSlash' : 'eye', 16)}
                  style={{ opacity: 0.6 }}
                />
              </button>
            </div>
            {getPasswordStrengthBar()}
          </div>


          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              First Name:
            </label>
            <input
              type="text"
              value={signUpData.firstName}
              onChange={(e) => handleSignUpDataChange('firstName', e.target.value)}
              required
              maxLength={50}
              autoComplete="given-name"
              autoCapitalize="words"
              autoCorrect="off"
              spellCheck="false"
              pattern="[a-zA-Z\s\-']{1,50}"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>

          <div style={{ marginBottom: '1rem' }}>
            <label style={{ display: 'block', marginBottom: '0.5rem', fontWeight: 'bold' }}>
              Last Name:
            </label>
            <input
              type="text"
              value={signUpData.lastName}
              onChange={(e) => handleSignUpDataChange('lastName', e.target.value)}
              required
              maxLength={50}
              autoComplete="family-name"
              autoCapitalize="words"
              autoCorrect="off"
              spellCheck="false"
              pattern="[a-zA-Z\s\-']{1,50}"
              style={{
                width: '100%',
                padding: '0.5rem',
                border: '1px solid #ddd',
                borderRadius: '4px',
                fontSize: '1rem'
              }}
            />
          </div>


          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '0.75rem',
              backgroundColor: '#e87500',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1
            }}
          >
            {loading ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>
      )}

          <div style={{ textAlign: 'center', marginTop: '1rem' }}>
            <button
              type="button"
              onClick={() => setIsSignUp(!isSignUp)}
              style={{
                background: 'none',
                border: 'none',
                color: '#e87500',
                cursor: 'pointer',
                textDecoration: 'underline'
              }}
            >
              {isSignUp ? 'Already have an account? Sign In' : 'Need an account? Sign Up'}
            </button>
          </div>
        </Card>
      </div>
    </PageContainer>
  );
};

export default Auth;
