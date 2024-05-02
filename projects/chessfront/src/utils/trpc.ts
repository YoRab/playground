import type { AppRouter } from '../../../chessback/src/app';
import { createTRPCReact } from '@trpc/react-query';

export const trpc = createTRPCReact<AppRouter>()

