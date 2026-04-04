const axios = require('axios');
const FormData = require('form-data');
const fs = require('fs');
const path = require('path');

async function testUpload() {
  try {
    // Attempt to register a user just to get a token, or just mock a token if we can 
    // Wait, let's just create a dummy pdf first
    const pdfPath = path.join(__dirname, 'dummy.pdf');
    fs.writeFileSync(pdfPath, 'dummy pdf content');

    // First login to get a token
    // We don't have a user, so register one
    const email = 'test' + Date.now() + '@example.com';
    const regRes = await axios.post('http://localhost:5000/api/v1/auth/register', {
      fullName: 'Test User',
      email: email,
      password: 'password123',
      role: 'faculty',
      department: 'CS'
    });
    const token = regRes.data.accessToken;

    console.log('Got token:', token);

    // Now upload
    const form = new FormData();
    form.append('title', 'Test Paper via Script');
    form.append('abstract', 'Test abstract which is really really really long to bypass limit. Test abstract which is really really really long to bypass limit.');
    form.append('authors', 'Test Author');
    form.append('keywords', 'Test Keyword');
    form.append('department', 'CS');
    form.append('year', '2024');
    form.append('file', fs.createReadStream(pdfPath));

    console.log('Sending upload...');
    const uploadRes = await axios.post('http://localhost:5000/api/v1/papers', form, {
      headers: {
        ...form.getHeaders(),
        Authorization: `Bearer ${token}`
      }
    });

    console.log('Upload Response:', uploadRes.data);
    
    // Check if the paper has pdfUrl
    console.log('PDF URL saved as:', uploadRes.data.paper.pdfUrl);

  } catch (error) {
    if (error.response) {
      console.error('Error:', error.response.status, error.response.data);
    } else {
      console.error('Network Error:', error.message);
    }
  }
}

testUpload();
