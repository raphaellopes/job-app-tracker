import "@testing-library/jest-dom";

// JSDOM does not implement scrolling; modals use `window.scrollTo` to restore position after unlock.
window.scrollTo = jest.fn();
