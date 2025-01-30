export const notFoundHandler = (req, res) => {
  res.status(404).json({
    status: 404,
    message: `${req.url} not found`,
  });
};
