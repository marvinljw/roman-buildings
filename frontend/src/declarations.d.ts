declare module '*.png' {
  const content: string;
  export default content;
}

declare module '*.png?url' {
  const value: string;
  export default value;
}

declare module '*.jpg?url' {
  const value: string;
  export default value;
}

declare module '*.jpeg?url' {
  const value: string;
  export default value;
}

declare module '*.gif?url' {
  const value: string;
  export default value;
}

declare module '*.svg?url' {
  const value: string;
  export default value;
}