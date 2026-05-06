import { Router, type IRouter } from "express";
import healthRouter from "./health";
import authRouter from "./auth";
import ownersRouter from "./owners";
import adminRouter from "./admin";
import dashboardRouter from "./dashboard";
import blogRouter from "./blog";
import rangeRouter from "./range";
import cpoRouter from "./cpo";
import accessoriesRouter from "./accessories";
import galleryRouter from "./gallery";
import faqRouter from "./faq";

const router: IRouter = Router();

router.use(healthRouter);
router.use(authRouter);
router.use(ownersRouter);
router.use(adminRouter);
router.use(dashboardRouter);
router.use(blogRouter);
router.use(rangeRouter);
router.use(cpoRouter);
router.use(accessoriesRouter);
router.use(galleryRouter);
router.use(faqRouter);

export default router;
