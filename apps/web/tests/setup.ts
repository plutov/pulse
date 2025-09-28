import { beforeAll } from 'vitest';
import { config } from '@vue/test-utils';

// Disable Vue warnings in tests
beforeAll(() => {
  config.global.config.warnHandler = (msg, instance, trace) => {
    // Suppress the resolveComponent warning
    if (msg.includes('resolveComponent can only be used in render() or setup()')) {
      return;
    }
    // Log other warnings for debugging
    console.warn(msg);
  };
});
