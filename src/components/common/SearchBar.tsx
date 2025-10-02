import React from 'react';
import { getIconProps } from '../../utils/assets';

interface SearchBarProps {
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  style?: React.CSSProperties;
  maxWidth?: string;
}

const SearchBar: React.FC<SearchBarProps> = ({
  placeholder = "Search...",
  value,
  onChange,
  style = {},
  maxWidth = "400px"
}) => {
  return (
    <div style={{ 
      display: 'flex', 
      justifyContent: 'center', 
      marginBottom: '2rem',
      ...style
    }}>
      <div style={{ 
        position: 'relative', 
        width: '100%', 
        maxWidth: maxWidth
      }}>
        <input
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          style={{
            width: '100%',
            padding: '0.75rem 1rem',
            paddingLeft: '2.5rem',
            border: '2px solid #e0e0e0',
            borderRadius: '8px',
            fontSize: '1rem',
            outline: 'none',
            transition: 'border-color 0.2s ease'
          }}
          onFocus={(e) => {
            e.target.style.borderColor = '#154734';
          }}
          onBlur={(e) => {
            e.target.style.borderColor = '#e0e0e0';
          }}
        />
        <img 
          src={getIconProps('search', 16).src}
          alt="Search"
          style={{
            position: 'absolute',
            left: '0.75rem',
            top: '50%',
            transform: 'translateY(-50%)',
            width: '16px',
            height: '16px',
            opacity: 0.6
          }}
        />
      </div>
    </div>
  );
};

export default SearchBar;
