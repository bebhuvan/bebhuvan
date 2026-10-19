import { feed } from '../../utils/feed';
export const GET = () => feed('notes', '/notes/rss.xml');
