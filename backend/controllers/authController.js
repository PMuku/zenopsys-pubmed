import User from '../models/User.js';

// POST /api/auth/login
export const login = async (req, res, next) => {
    try {
        const { email } = req.body;
        if (!email) {
            const error = new Error('Email is required');
            error.status = 400;
            return next(error);
        }

        let user = await User.findOne({ email });
        if (!user) {
            user = new User({ email });
            await user.save();
        }
        res.status(200).json({ message: 'Login successful', user });
    } catch (error) {
        next(error);
    }
};