import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
  disabled?: boolean;
}

interface SelectProps {
  value: string | number;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  className?: string;
  style?: React.CSSProperties;
}

const Select: React.FC<SelectProps> = ({
  value,
  onChange,
  options,
  placeholder,
  disabled = false,
  className = '',
  style = {}
}) => {
  const defaultStyle: React.CSSProperties = {
    padding: '0.25rem 0.5rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '0.875rem',
    backgroundColor: disabled ? '#f8f9fa' : '#fff',
    cursor: disabled ? 'not-allowed' : 'pointer',
    minWidth: '120px',
    ...style
  };

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      disabled={disabled}
      className={className}
      style={defaultStyle}
    >
      {placeholder && (
        <option value="" disabled={!placeholder}>
          {placeholder}
        </option>
      )}
      {options.map((option) => (
        <option
          key={option.value}
          value={option.value}
          disabled={option.disabled}
        >
          {option.label}
        </option>
      ))}
    </select>
  );
};

export default Select;
