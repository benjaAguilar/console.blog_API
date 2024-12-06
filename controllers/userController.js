async function getUsers(req, res, next){
    res.json({cheers: 'Hello to users API'});
}

const userController = {
    getUsers
}

export default userController;