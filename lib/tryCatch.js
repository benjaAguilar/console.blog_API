import Errors from "./customError.js";

const tryCatch = (controller) => async (req, res, next) => {
    try {
        await controller(req, res, next);
    } catch(error){
        return next(error);
    }
}

export const tryQuery = async (query) => {
    try{
        const res = await query();
        return res;
    } catch(error){
        throw new Errors.dbError(
            'Oops! there was a problem on the database. Try again.',
            500,
            error
        );
    }
}

export default tryCatch;