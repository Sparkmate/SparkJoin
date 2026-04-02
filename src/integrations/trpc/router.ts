import { createTRPCRouter } from "./init";
import { candidateProcessRouter } from "./routes/candidate-process";
import { candidateProfileRouter } from "./routes/candidate-profile";
import { configRouter } from "./routes/config";
import { pagesRouter } from "./routes/pages";
import { userRouter } from "./routes/user";

export const trpcRouter = createTRPCRouter({
	pages: pagesRouter,
	config: configRouter,
	user: userRouter,
	candidate: createTRPCRouter({
		process: candidateProcessRouter,
		profile: candidateProfileRouter,
	}),
});
export type TRPCRouter = typeof trpcRouter;
