async function getPosts(req, res, next){
    res.json({cheers: 'Hello to posts API'});
}

const postController = {
    getPosts
}

export default postController;