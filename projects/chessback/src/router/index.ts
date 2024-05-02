import { router } from '../services/trpc';
import protectedRouter from './protectedRouter';
import publicRouter from './publicRouter';

// Merge routers together
const appRouter = router({
    public: publicRouter,
    protected: protectedRouter
});

export default appRouter