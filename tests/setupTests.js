import { configure } from 'enzyme';
import Adapter from 'enzyme-adapter-react-16';

require('jest-fetch-mock').enableMocks();

fetch.mockResponse(JSON.stringify({ bookId: 1, bookTitle: 'jest test', price: 24.99 }));

configure({ adapter: new Adapter() });
