export default function getDomain() {
  const domain = window.location.hostname.replace("www.", "");
  return domain;
}
