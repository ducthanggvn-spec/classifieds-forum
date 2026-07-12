const axios = require('axios');

class FacebookService {
  constructor() {
    this.pageId = process.env.FB_PAGE_ID;
    this.accessToken = process.env.FB_PAGE_ACCESS_TOKEN;
    this.baseUrl = 'https://graph.facebook.com/v19.0';
  }

  /**
   * Upload an image to Facebook as unpublished photo to get media ID
   */
  async uploadPhoto(imageUrl) {
    try {
      const response = await axios.post(`${this.baseUrl}/${this.pageId}/photos`, null, {
        params: {
          url: imageUrl,
          published: false,
          access_token: this.accessToken,
        },
      });
      return response.data.id;
    } catch (error) {
      console.error('Lỗi khi upload ảnh lên Facebook:', error.response?.data || error.message);
      return null;
    }
  }

  /**
   * Post to Facebook Page
   * @param {string} message 
   * @param {Array<string>} imageUrls 
   */
  async createPost(message, imageUrls = []) {
    if (!this.pageId || !this.accessToken) {
      throw new Error('Chưa cấu hình FB_PAGE_ID hoặc FB_PAGE_ACCESS_TOKEN');
    }

    try {
      const mediaIds = [];
      // Upload hình ảnh trước (nếu có)
      for (const url of imageUrls) {
        if (url) {
          const mediaId = await this.uploadPhoto(url);
          if (mediaId) {
            mediaIds.push({ media_fbid: mediaId });
          }
        }
      }

      const postData = {
        message,
        access_token: this.accessToken,
      };

      // Đính kèm hình ảnh vào bài đăng
      if (mediaIds.length > 0) {
        postData.attached_media = mediaIds;
      }

      const response = await axios.post(`${this.baseUrl}/${this.pageId}/feed`, postData);
      return response.data.id;
    } catch (error) {
      console.error('Lỗi khi đăng bài lên Facebook:', error.response?.data || error.message);
      throw error;
    }
  }
}

module.exports = new FacebookService();
