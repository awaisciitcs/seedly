import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { inspectProductionEnvironment, inspectPublishedCmsOrigin } from './production-readiness.mjs';

/** Gate hosted production builds without mutating database, Auth, Storage or email state. */
export async function inspectVercelBuildGuard(environment = process.env, clientFactory) {
  if (environment.VERCEL_ENV !== 'production') {
    return { skipped: true, configurationReady: true, checks: [] };
  }

  // Imported readiness helpers do not load .env.local. Vercel must supply its own values.
  const configuration = inspectProductionEnvironment(environment, true);
  const checks = [...configuration.checks];
  if (configuration.configurationReady) {
    checks.push(await inspectPublishedCmsOrigin(environment, true, clientFactory));
  }
  return { skipped: false, configurationReady: checks.every(check => check.status !== 'FAIL'), checks };
}

const main = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url);
if (main) {
  try {
    const report = await inspectVercelBuildGuard();
    if (report.skipped) {
      console.log('Production configuration guard skipped outside Vercel production.');
    } else {
      for (const check of report.checks) {
        const message = check.status + ': ' + check.name + (check.action ? ' - ' + check.action : '');
        if (check.status === 'FAIL') console.error(message);
        else console.log(message);
      }
      if (!report.configurationReady) {
        console.error('Vercel production build blocked. Correct the Production environment or published CMS configuration and redeploy.');
        process.exitCode = 1;
      } else {
        console.log('Vercel production configuration guard passed. No data was changed.');
      }
    }
  } catch {
    // Never emit an upstream exception, request object or environment value into build logs.
    console.error('Vercel production configuration verification failed unexpectedly. Check the Production environment and Supabase availability before redeploying.');
    process.exitCode = 1;
  }
}
