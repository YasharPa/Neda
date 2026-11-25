import { getSignByCode, getSignsPage } from "../services/signsService.js";

export const getSign = async (req, res) => {
  const signId = req.params.code;

  const data = await getSignByCode(signId);

  res.json({ data: data });
};

export const listSigns = async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 4;

  const { data, count, hasMore } = await getSignsPage(page, limit);

  res.json({
    data: data,
    page: page,
    limit: limit,
    total: count,
    hasMore: hasMore,
  });
};
