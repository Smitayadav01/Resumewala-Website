const bizSdk = await import("facebook-nodejs-business-sdk");
const ServerEvent = bizSdk.ServerEvent;
const EventRequest = bizSdk.EventRequest;
const UserData = bizSdk.UserData;
const Content = bizSdk.Content;
const FacebookAdsApi = bizSdk.FacebookAdsApi;

const PIXEL_ID = "1430211398866324";
const ACCESS_TOKEN = process.env.META_ACCESS_TOKEN;

export const sendCapiEvent = async ({ eventName, email, phone, clientIp, clientUserAgent, eventSourceUrl }) => {
  try {
    FacebookAdsApi.init(ACCESS_TOKEN);

    const userData = new UserData()
      .setEmails([email || ""])
      .setPhones([phone || ""])
      .setClientIpAddress(clientIp || "")
      .setClientUserAgent(clientUserAgent || "");

    const serverEvent = new ServerEvent()
      .setEventName(eventName)
      .setEventTime(Math.floor(Date.now() / 1000))
      .setUserData(userData)
      .setEventSourceUrl(eventSourceUrl || process.env.FRONTEND_URL)
      .setActionSource("website");

    const eventsData = [serverEvent];
    const eventRequest = new EventRequest(ACCESS_TOKEN, PIXEL_ID)
      .setEvents(eventsData);

    const response = await eventRequest.execute();
    console.log(`[Meta CAPI] ${eventName} sent:`, response);
  } catch (err) {
    console.error("[Meta CAPI] Error:", err);
  }
};