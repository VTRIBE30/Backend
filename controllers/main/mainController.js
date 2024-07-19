exports.home = (req, res) => {
  res.status(200).json({
    status: true,
    message: "Escrow Backend API is up and running!",
  });
};

exports.notFound = (req, res) => {
  res.status(404).json({
    status: false,
    message: "Endpoint not found",
  });
};
