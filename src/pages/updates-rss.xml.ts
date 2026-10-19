// the old notes feed (when notes were "updates"); its subscribers now get the notes
import { feed } from '../utils/feed';
export const GET = () => feed('notes', '/updates-rss.xml');
