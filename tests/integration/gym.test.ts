/**
 * 健身房模块集成测试
 * 测试健身房相关的API端点和业务逻辑
 */

import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { testUtils } from './setup';

describe('Gym Integration Tests', () => {
  let app: INestApplication;
  
  beforeAll(() => {
    app = testUtils.getApp();
  });

  beforeEach(async () => {
    // 清理健身房表数据
    await testUtils.cleanTable('gyms');
  });

  describe('POST /api/gyms', () => {
    it('should create a new gym with valid data', async () => {
      const gymData = {
        name: 'Test CrossFit Box',
        address: '123 Test Street, Test City',
        latitude: 40.7128,
        longitude: -74.0060,
        description: 'A test CrossFit gym'
      };

      const response = await request(app.getHttpServer())
        .post('/api/gyms')
        .send(gymData)
        .expect(201);

      expect(response.body).toMatchObject({
        id: expect.any(String),
        name: gymData.name,
        address: gymData.address,
        latitude: gymData.latitude,
        longitude: gymData.longitude,
        description: gymData.description,
        createdAt: expect.any(String),
        updatedAt: expect.any(String)
      });

      // 验证数据是否正确保存到数据库
      const dataSource = testUtils.getDataSource();
      const savedGym = await dataSource.query(
        'SELECT * FROM gyms WHERE id = ?',
        [response.body.id]
      );

      expect(savedGym).toHaveLength(1);
      expect(savedGym[0].name).toBe(gymData.name);
    });

    it('should return 400 for invalid gym data', async () => {
      const invalidGymData = {
        name: '', // 空名称应该失败
        address: '123 Test Street',
        latitude: 'invalid', // 无效的纬度
        longitude: -74.0060
      };

      const response = await request(app.getHttpServer())
        .post('/api/gyms')
        .send(invalidGymData)
        .expect(400);

      expect(response.body).toHaveProperty('message');
      expect(response.body.message).toContain('validation');
    });

    it('should return 400 for missing required fields', async () => {
      const incompleteGymData = {
        address: '123 Test Street'
        // 缺少必需的 name 字段
      };

      await request(app.getHttpServer())
        .post('/api/gyms')
        .send(incompleteGymData)
        .expect(400);
    });
  });

  describe('GET /api/gyms', () => {
    beforeEach(async () => {
      // 创建测试数据
      await testUtils.createTestGym({ name: 'Gym 1', address: 'Address 1' });
      await testUtils.createTestGym({ name: 'Gym 2', address: 'Address 2' });
      await testUtils.createTestGym({ name: 'Gym 3', address: 'Address 3' });
    });

    it('should return all gyms', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/gyms')
        .expect(200);

      expect(response.body).toHaveLength(3);
      expect(response.body[0]).toHaveProperty('id');
      expect(response.body[0]).toHaveProperty('name');
      expect(response.body[0]).toHaveProperty('address');
    });

    it('should filter gyms by search query', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/gyms')
        .query({ search: 'Gym 1' })
        .expect(200);

      expect(response.body).toHaveLength(1);
      expect(response.body[0].name).toBe('Gym 1');
    });

    it('should limit results with limit parameter', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/gyms')
        .query({ limit: 2 })
        .expect(200);

      expect(response.body).toHaveLength(2);
    });

    it('should support pagination with offset', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/gyms')
        .query({ limit: 2, offset: 1 })
        .expect(200);

      expect(response.body).toHaveLength(2);
      // 验证返回的不是第一个记录
    });
  });

  describe('GET /api/gyms/:id', () => {
    let testGym: any;

    beforeEach(async () => {
      testGym = await testUtils.createTestGym({
        name: 'Test Gym for Get',
        address: '456 Test Avenue'
      });
    });

    it('should return gym by valid id', async () => {
      const response = await request(app.getHttpServer())
        .get(`/api/gyms/${testGym.id}`)
        .expect(200);

      expect(response.body).toMatchObject({
        id: testGym.id,
        name: testGym.name,
        address: testGym.address
      });
    });

    it('should return 404 for non-existent gym', async () => {
      const nonExistentId = 'non-existent-gym-id';
      
      await request(app.getHttpServer())
        .get(`/api/gyms/${nonExistentId}`)
        .expect(404);
    });

    it('should return 400 for invalid id format', async () => {
      const invalidId = 'invalid-id-format';
      
      await request(app.getHttpServer())
        .get(`/api/gyms/${invalidId}`)
        .expect(400);
    });
  });

  describe('PUT /api/gyms/:id', () => {
    let testGym: any;

    beforeEach(async () => {
      testGym = await testUtils.createTestGym({
        name: 'Original Gym Name',
        address: 'Original Address'
      });
    });

    it('should update gym with valid data', async () => {
      const updateData = {
        name: 'Updated Gym Name',
        address: 'Updated Address',
        description: 'Updated description'
      };

      const response = await request(app.getHttpServer())
        .put(`/api/gyms/${testGym.id}`)
        .send(updateData)
        .expect(200);

      expect(response.body).toMatchObject({
        id: testGym.id,
        name: updateData.name,
        address: updateData.address,
        description: updateData.description
      });

      // 验证数据库中的数据已更新
      const dataSource = testUtils.getDataSource();
      const updatedGym = await dataSource.query(
        'SELECT * FROM gyms WHERE id = ?',
        [testGym.id]
      );

      expect(updatedGym[0].name).toBe(updateData.name);
    });

    it('should return 404 for non-existent gym', async () => {
      const updateData = { name: 'Updated Name' };
      
      await request(app.getHttpServer())
        .put('/api/gyms/non-existent-id')
        .send(updateData)
        .expect(404);
    });

    it('should return 400 for invalid update data', async () => {
      const invalidUpdateData = {
        name: '', // 空名称
        latitude: 'invalid'
      };

      await request(app.getHttpServer())
        .put(`/api/gyms/${testGym.id}`)
        .send(invalidUpdateData)
        .expect(400);
    });
  });

  describe('DELETE /api/gyms/:id', () => {
    let testGym: any;

    beforeEach(async () => {
      testGym = await testUtils.createTestGym({
        name: 'Gym to Delete',
        address: 'Delete Address'
      });
    });

    it('should delete existing gym', async () => {
      await request(app.getHttpServer())
        .delete(`/api/gyms/${testGym.id}`)
        .expect(200);

      // 验证健身房已从数据库中删除
      const dataSource = testUtils.getDataSource();
      const deletedGym = await dataSource.query(
        'SELECT * FROM gyms WHERE id = ?',
        [testGym.id]
      );

      expect(deletedGym).toHaveLength(0);
    });

    it('should return 404 for non-existent gym', async () => {
      await request(app.getHttpServer())
        .delete('/api/gyms/non-existent-id')
        .expect(404);
    });
  });

  describe('Location-based queries', () => {
    beforeEach(async () => {
      // 创建不同位置的健身房
      await testUtils.createTestGym({
        name: 'NYC Gym',
        latitude: 40.7128,
        longitude: -74.0060
      });
      await testUtils.createTestGym({
        name: 'LA Gym',
        latitude: 34.0522,
        longitude: -118.2437
      });
    });

    it('should find gyms near specific coordinates', async () => {
      const response = await request(app.getHttpServer())
        .get('/api/gyms')
        .query({
          latitude: 40.7128,
          longitude: -74.0060,
          radius: 10 // 10km radius
        })
        .expect(200);

      expect(response.body.length).toBeGreaterThan(0);
      expect(response.body[0].name).toBe('NYC Gym');
    });
  });

  describe('Error handling', () => {
    it('should handle database connection errors gracefully', async () => {
      // 这个测试需要模拟数据库连接错误
      // 在实际项目中，你可能需要使用mock或者临时断开数据库连接
      
      // Mock数据库错误的示例（需要根据实际情况调整）
      jest.spyOn(testUtils.getDataSource(), 'query')
        .mockRejectedValueOnce(new Error('Database connection lost'));

      await request(app.getHttpServer())
        .get('/api/gyms')
        .expect(500);

      // 恢复原始行为
      jest.restoreAllMocks();
    });
  });

  describe('Performance tests', () => {
    it('should handle large number of gyms efficiently', async () => {
      // 创建大量测试数据
      const promises = [];
      for (let i = 0; i < 100; i++) {
        promises.push(testUtils.createTestGym({
          name: `Performance Test Gym ${i}`,
          address: `Address ${i}`
        }));
      }
      await Promise.all(promises);

      const startTime = Date.now();
      
      const response = await request(app.getHttpServer())
        .get('/api/gyms')
        .expect(200);

      const endTime = Date.now();
      const responseTime = endTime - startTime;

      expect(response.body).toHaveLength(100);
      expect(responseTime).toBeLessThan(1000); // 应该在1秒内完成
    });
  });
});