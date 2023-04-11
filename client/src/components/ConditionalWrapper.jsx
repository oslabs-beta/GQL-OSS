/* ConditionalWrapper is a simple HOC which upon truthy condition, returns the wrapper component around its children */
/* Used to conditionally wrap MUI tooltips depending on circumstances */
const ConditionalWrapper = ({ condition, wrapper, children }) =>
  condition ? wrapper(children) : children;

export default ConditionalWrapper;
