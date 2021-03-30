import axios from 'axios';

const fetch = (url: string) => axios.get(url)
    .then(response=>response.data)


export default fetch
