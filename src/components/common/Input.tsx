import React from 'react';

interface InputProps {
  label?: string;
  type?: 'text' | 'email' | 'password' | 'number' | 'tel' | 'url';
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  required?: boolean;
  disabled?: boolean;
  error?: string;
  style?: React.CSSProperties;
  inputStyle?: React.CSSProperties;
  labelStyle?: React.CSSProperties;
}

const Input: React.FC<InputProps> = ({
  label,
  type = 'text',
  value,
  onChange,
  placeholder,
  required = false,
  disabled = false,
  error,
  style = {},
  inputStyle = {},
  labelStyle = {}
}) => {
  const containerStyles: React.CSSProperties = {
    marginBottom: '1rem',
    ...style
  };

  const labelStyles: React.CSSProperties = {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 'bold',
    color: '#154734',
    ...labelStyle
  };

  const inputStyles: React.CSSProperties = {
    width: '100%',
    padding: '0.5rem',
    border: `1px solid ${error ? '#dc3545' : '#ddd'}`,
    borderRadius: '4px',
    fontSize: '1rem',
    backgroundColor: disabled ? '#f8f9fa' : '#fff',
    color: disabled ? '#6c757d' : '#000',
    ...inputStyle
  };

  const errorStyles: React.CSSProperties = {
    color: '#dc3545',
    fontSize: '0.875rem',
    marginTop: '0.25rem'
  };

  return (
    <div style={containerStyles}>
      {label && (
        <label style={labelStyles}>
          {label}
          {required && <span style={{ color: '#dc3545', marginLeft: '0.25rem' }}>*</span>}
        </label>
      )}
      <input
        type={type}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        required={required}
        disabled={disabled}
        style={inputStyles}
      />
      {error && (
        <div style={errorStyles}>
          {error}
        </div>
      )}
    </div>
  );
};

export default Input;
