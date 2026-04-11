export const requireUser = (req, res, next) => {
    const userId = req.header('x-user-id');

    if (!userId) {
        const err = new Error('User ID is required in x-user-id header');
        err.status = 401;
        return next(err);
    }

    req.user = { id: userId };
    next();
};