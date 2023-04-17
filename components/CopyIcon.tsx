export const CopyIcon = ({
    fill,
    size,
    height = 24,
    width = 24,
    ...props
  }) => {
    return (
      <svg
        width={size || width || 24}
        height={size || height || 24}
        viewBox="0 0 20 20"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"

        stroke={"black"} 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round"
        {...props}
      >
        <rect x="6" y="6" width="13" height="13" rx="2" ry="2"></rect>
        <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"></path>
      </svg>
    );
  };
  