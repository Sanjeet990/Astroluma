
exports.home = (res) => {
    return res.status(200).json({
        error: false,
        message: "API running fine."
    });
}