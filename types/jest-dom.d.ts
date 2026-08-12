// jest.setup.mjs is not part of the TS program (tsconfig includes .ts/.tsx/.mts),
// so the jest-dom matcher augmentation has to be pulled in explicitly for tsc.
import '@testing-library/jest-dom';
