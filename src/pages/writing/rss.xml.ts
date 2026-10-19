import { feed } from '../../utils/feed';
export const GET = () => feed('essays', '/writing/rss.xml');
