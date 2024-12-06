async function getComments(req, res, next){
    res.json({cheers: 'Hello to comments API'});
}

const commentController = {
    getComments
}

export default commentController;