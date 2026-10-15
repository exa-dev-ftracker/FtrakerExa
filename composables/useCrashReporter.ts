import { crashReporter } from '~/utils/crashReporter';

/**
 * Composable for accessing crashReporter within Vue components
 */
export const useCrashReporter = () => {
  return {
    crashReporter,
    recordError: crashReporter.recordError.bind(crashReporter),
    recordLog: crashReporter.recordLog.bind(crashReporter),
    recordHttpError: crashReporter.recordHttpError.bind(crashReporter),
    flush: crashReporter.flushImmediately.bind(crashReporter),
  };
};
