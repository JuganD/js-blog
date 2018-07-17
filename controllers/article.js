const Article = require('../models').Article;
const User = require('../models').User;

module.exports = {
    createGet: (req, res) => {
        if (!req.isAuthenticated()) {
            res.redirect('/');
        } else {
            res.render('article/create');
        }

    },
    createPost: (req, res) => {
        let articleArgs = req.body;
        let errorMsg = '';

        if (!req.isAuthenticated()) {
            errorMsg = 'You should be logged in to make articles!';
            res.redirect('/');
        } else if (!articleArgs.title) {
            errorMsg = 'Invalid title!';
        } else if (!articleArgs.content) {
            errorMsg = 'Invalid content!';
        }

        if (errorMsg) {
            res.render('article/create', {error: errorMsg});
            return;
        }
        articleArgs.authorId = req.user.id;

        Article.create(articleArgs).then(article => {
            res.redirect('/');
        }).catch(err => {
            console.log(err.message);
            res.render('article/create', {error: err.message});
        });
    },
    details: (req, res) => {
        let id = req.params.id;
        Article
            .findById(id, {include: [
                {
                    model: User,
                }
            ]
        })
            .then(article => {
                res.render('article/details', article.dataValues)
        });
    },
    editGet: (req, res) => {
        if (req.isAuthenticated()) {
        let articleId = req.params.id;
        let userId = req.user.id;
        Article
            .findById(articleId)
            .then(article => {
            if (article.dataValues.authorId == userId){
                res.render('article/edit', article.dataValues)
            } else {
                res.redirect('/myarticles');
            }

        })} else {
            res.redirect('/');
        }
    },
    editPost: (req, res) => {
        let articleArgs = req.body;
        let articleId = req.params.id;
        let userId = req.user.id;
        Article
            .findById(articleId)
            .then(article => {
            if (article.dataValues.authorId == userId){
                article.update(articleArgs)
                res.redirect('/myarticles');
            } else {
                res.redirect('/myarticles');
            }

        })
    },
    deleteGet: (req, res) => {
        if (req.isAuthenticated()) {
        let articleId = req.params.id;
        let userId = req.user.id;
        Article
            .findById(articleId)
            .then(article => {
            if (article.dataValues.authorId == userId){
                res.render('article/delete', article.dataValues);
            } else {
                res.redirect('/myarticles');
            }

        })
            .catch(() => {
            res.redirect('/myarticles');
        })} else {
            res.redirect('/');
        }
    },
    deletePost: (req, res) => {
        let articleId = req.params.id;
        let userId = req.user.id;
        Article
            .findById(articleId)
            .then(article => {
            if (article.dataValues.authorId == userId){
                article.destroy().then(() => {
                    res.redirect('/myarticles');
                })

            } else {
                res.redirect('/myarticles');
            }

        })
            .catch(() => {
            res.redirect('/myarticles');
        })
    },
    myArticlesGet: (req, res) => {
        if (req.isAuthenticated()) {
        Article
            .findAll({where: {authorId: req.user.id},limit: 6, include: [{model: User}]})
            .then(articles => {
            res.render('home/myarticles', {articles: articles});
        }).catch(() => {
            res.redirect('/');
        })} else {
            res.redirect('/');
        }
    },
};