export const API_URL = `${process.env.API_ORIGIN}/api/weblarek/cohort30`;
export const CDN_URL = `${process.env.API_ORIGIN}/content/weblarek/cohort30`;

export const settings = {
  headers: {
    autorization: `${process.env.API_TOKEN}`,
    "Content-Type": "application/json",
  },
};
