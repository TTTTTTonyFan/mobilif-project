<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MobiLiF 场馆列表 - 手机预览版</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', sans-serif;
            background-color: #f5f5f5;
            line-height: 1.4;
        }
        
        /* 手机容器 */
        .phone-container {
            width: 375px;
            height: 812px;
            margin: 20px auto;
            background: #000;
            border-radius: 25px;
            padding: 10px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.3);
        }
        
        .phone-screen {
            width: 100%;
            height: 100%;
            background: #fff;
            border-radius: 20px;
            overflow: hidden;
            position: relative;
        }
        
        /* 状态栏 */
        .status-bar {
            height: 44px;
            background: #fff;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 0 20px;
            font-size: 14px;
            font-weight: 600;
        }
        
        /* 导航栏 */
        .nav-bar {
            height: 44px;
            background: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            border-bottom: 1px solid #eee;
            font-size: 18px;
            font-weight: 600;
            color: #333;
        }
        
        /* Tab栏 */
        .tab-bar {
            height: 50px;
            background: #fff;
            display: flex;
            border-bottom: 1px solid #eee;
        }
        
        .tab-item {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            color: #999;
            cursor: pointer;
        }
        
        .tab-item.active {
            color: #ff4d4f;
        }
        
        .tab-icon {
            width: 20px;
            height: 20px;
            margin-bottom: 2px;
            background: #ddd;
            border-radius: 2px;
        }
        
        .tab-item.active .tab-icon {
            background: #ff4d4f;
        }
        
        /* 主内容区 */
        .main-content {
            height: calc(100% - 44px - 44px - 50px - 83px);
            overflow-y: auto;
        }
        
        /* 城市选择器 */
        .city-selector {
            height: 50px;
            background: #fff;
            display: flex;
            align-items: center;
            padding: 0 16px;
            border-bottom: 1px solid #eee;
        }
        
        .city-name {
            font-size: 16px;
            font-weight: 600;
            color: #333;
            display: flex;
            align-items: center;
        }
        
        .city-arrow {
            margin-left: 4px;
            width: 0;
            height: 0;
            border-left: 4px solid transparent;
            border-right: 4px solid transparent;
            border-top: 4px solid #999;
        }
        
        /* 搜索和筛选栏 */
        .search-filter-bar {
            height: 50px;
            background: #fff;
            display: flex;
            align-items: center;
            padding: 0 16px;
            gap: 12px;
        }
        
        .search-input {
            flex: 1;
            height: 36px;
            background: #f5f5f5;
            border: none;
            border-radius: 18px;
            padding: 0 16px;
            font-size: 14px;
            color: #333;
        }
        
        .filter-btn {
            width: 60px;
            height: 36px;
            background: #fff;
            border: 1px solid #ddd;
            border-radius: 18px;
            font-size: 14px;
            color: #333;
            display: flex;
            align-items: center;
            justify-content: center;
        }
        
        .filter-btn.active {
            background: #ff4d4f;
            color: #fff;
            border-color: #ff4d4f;
        }
        
        /* 场馆列表 */
        .gym-list {
            padding: 16px;
        }
        
        .gym-card {
            background: #fff;
            border-radius: 12px;
            margin-bottom: 16px;
            padding: 16px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.06);
        }
        
        .gym-header {
            display: flex;
            justify-content: space-between;
            align-items: flex-start;
            margin-bottom: 8px;
        }
        
        .gym-name {
            font-size: 16px;
            font-weight: 600;
            color: #333;
            line-height: 1.3;
        }
        
        .gym-distance {
            font-size: 12px;
            color: #666;
            white-space: nowrap;
        }
        
        .gym-address {
            font-size: 13px;
            color: #666;
            margin-bottom: 8px;
            line-height: 1.3;
        }
        
        .gym-info {
            display: flex;
            align-items: center;
            gap: 12px;
            margin-bottom: 8px;
        }
        
        .gym-rating {
            display: flex;
            align-items: center;
            font-size: 12px;
            color: #666;
        }
        
        .rating-stars {
            color: #ffa940;
            margin-right: 4px;
        }
        
        .gym-status {
            font-size: 12px;
            padding: 2px 8px;
            border-radius: 10px;
        }
        
        .status-open {
            background: #f6ffed;
            color: #52c41a;
        }
        
        .status-closed {
            background: #fff2e8;
            color: #fa8c16;
        }
        
        .gym-tags {
            display: flex;
            gap: 8px;
            flex-wrap: wrap;
        }
        
        .gym-tag {
            font-size: 11px;
            padding: 3px 8px;
            border-radius: 10px;
            background: #f0f0f0;
            color: #666;
        }
        
        .tag-crossfit {
            background: #fff0f6;
            color: #c41d7f;
        }
        
        .tag-certified {
            background: #f6ffed;
            color: #52c41a;
        }
        
        /* 底部Tab栏 */
        .bottom-tab-bar {
            height: 83px;
            background: #fff;
            border-top: 1px solid #eee;
            display: flex;
            padding-bottom: 34px;
        }
        
        .bottom-tab-item {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-size: 10px;
            color: #999;
            cursor: pointer;
        }
        
        .bottom-tab-item.active {
            color: #ff4d4f;
        }
        
        .bottom-tab-icon {
            width: 24px;
            height: 24px;
            margin-bottom: 4px;
            background: #ddd;
            border-radius: 4px;
        }
        
        .bottom-tab-item.active .bottom-tab-icon {
            background: #ff4d4f;
        }
        
        /* 加载状态 */
        .loading {
            text-align: center;
            padding: 20px;
            color: #999;
            font-size: 14px;
        }
        
        /* 响应式适配 */
        @media (max-width: 414px) {
            .phone-container {
                width: 100%;
                height: 100vh;
                margin: 0;
                border-radius: 0;
                padding: 0;
            }
            
            .phone-screen {
                border-radius: 0;
            }
        }
        
        /* 模拟数据样式 */
        .mock-data-indicator {
            position: fixed;
            top: 10px;
            right: 10px;
            background: #52c41a;
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 12px;
            z-index: 1000;
        }
    </style>
</head>
<body>
    <div class="mock-data-indicator">模拟数据</div>
    
    <div class="phone-container">
        <div class="phone-screen">
            <!-- 状态栏 -->
            <div class="status-bar">
                <span>9:41</span>
                <span>📶 🔋</span>
            </div>
            
            <!-- 导航栏 -->
            <div class="nav-bar">
                MobiLiF
            </div>
            
            <!-- Tab栏 -->
            <div class="tab-bar">
                <div class="tab-item">
                    <div class="tab-icon"></div>
                    <span>首页</span>
                </div>
                <div class="tab-item active">
                    <div class="tab-icon"></div>
                    <span>Drop-in预约</span>
                </div>
                <div class="tab-item">
                    <div class="tab-icon"></div>
                    <span>我的</span>
                </div>
            </div>
            
            <!-- 主内容区 -->
            <div class="main-content">
                <!-- 城市选择器 -->
                <div class="city-selector" onclick="showCitySelector()">
                    <div class="city-name">
                        北京
                        <div class="city-arrow"></div>
                    </div>
                </div>
                
                <!-- 搜索和筛选栏 -->
                <div class="search-filter-bar">
                    <input type="text" class="search-input" placeholder="搜索场馆名称或地址" onkeyup="handleSearch(this.value)">
                    <button class="filter-btn" id="filterBtn" onclick="showFilterModal()">筛选</button>
                </div>
                
                <!-- 场馆列表 -->
                <div class="gym-list" id="gymList">
                    <!-- 场馆卡片将通过JavaScript动态生成 -->
                </div>
            </div>
            
            <!-- 底部Tab栏 -->
            <div class="bottom-tab-bar">
                <div class="bottom-tab-item">
                    <div class="bottom-tab-icon"></div>
                    <span>首页</span>
                </div>
                <div class="bottom-tab-item active">
                    <div class="bottom-tab-icon"></div>
                    <span>预约</span>
                </div>
                <div class="bottom-tab-item">
                    <div class="bottom-tab-icon"></div>
                    <span>社区</span>
                </div>
                <div class="bottom-tab-item">
                    <div class="bottom-tab-icon"></div>
                    <span>我的</span>
                </div>
            </div>
        </div>
    </div>

    <script>
        // 模拟场馆数据
        const mockGyms = [
            {
                id: '1',
                name: 'MobiLiF CrossFit北京站',
                address: '北京市朝阳区三里屯太古里南区B1-021',
                city: '北京',
                distance: 1.2,
                rating: 4.8,
                reviewCount: 156,
                businessStatus: '营业中',
                todayHours: '06:00-22:00',
                gymType: 'CrossFit认证场馆',
                crossfitCertified: true,
                supportedPrograms: ['CrossFit', 'Olympic Lifting', 'Gymnastics'],
                tags: ['新手友好', '停车方便', '淋浴间', 'CrossFit认证'],
                verified: true,
                featured: true
            },
            {
                id: '2',
                name: '力量工厂健身房',
                address: '北京市海淀区中关村大街1号海龙大厦3层',
                city: '北京',
                distance: 2.5,
                rating: 4.5,
                reviewCount: 89,
                businessStatus: '营业中',
                todayHours: '06:00-23:00',
                gymType: '综合训练馆',
                crossfitCertified: false,
                supportedPrograms: ['Powerlifting', 'Functional Fitness', 'Bodybuilding'],
                tags: ['器械齐全', '教练专业', '环境优雅'],
                verified: true,
                featured: false
            },
            {
                id: '3',
                name: 'Beast Mode训练馆',
                address: '北京市朝阳区望京SOHO T3座15层',
                city: '北京',
                distance: 3.8,
                rating: 4.7,
                reviewCount: 203,
                businessStatus: '营业中',
                todayHours: '05:30-23:30',
                gymType: 'CrossFit认证场馆',
                crossfitCertified: true,
                supportedPrograms: ['CrossFit', 'Hyrox', 'Olympic Lifting'],
                tags: ['24小时', 'CrossFit认证', '竞赛级器械'],
                verified: true,
                featured: true
            },
            {
                id: '4',
                name: '悦动健身工作室',
                address: '北京市东城区王府井大街138号新燕莎金街购物广场',
                city: '北京',
                distance: 4.2,
                rating: 4.3,
                reviewCount: 67,
                businessStatus: '休息中',
                todayHours: '09:00-21:00',
                gymType: '专项训练馆',
                crossfitCertified: false,
                supportedPrograms: ['Yoga', 'Pilates', 'Functional Fitness'],
                tags: ['女性专属', '瑜伽专业', '小班教学'],
                verified: true,
                featured: false
            },
            {
                id: '5',
                name: 'Iron Paradise铁人天堂',
                address: '北京市西城区西单北大街176号太平洋百货B2',
                city: '北京',
                distance: 5.1,
                rating: 4.6,
                reviewCount: 134,
                businessStatus: '营业中',
                todayHours: '06:00-22:00',
                gymType: '综合训练馆',
                crossfitCertified: false,
                supportedPrograms: ['Powerlifting', 'Bodybuilding', 'CrossFit', 'Boxing'],
                tags: ['硬核训练', '专业器械', '私教优秀'],
                verified: true,
                featured: false
            }
        ];

        let currentGyms = [...mockGyms];
        let currentCity = '北京';
        let currentFilters = {
            gymType: '',
            programs: []
        };

        // 渲染场馆列表
        function renderGymList(gyms) {
            const gymListContainer = document.getElementById('gymList');
            
            if (gyms.length === 0) {
                gymListContainer.innerHTML = `
                    <div class="loading">
                        暂无符合条件的场馆<br>
                        <small>试试调整搜索条件或筛选条件</small>
                    </div>
                `;
                return;
            }
            
            const gymCards = gyms.map(gym => `
                <div class="gym-card" onclick="viewGymDetail('${gym.id}')">
                    <div class="gym-header">
                        <div class="gym-name">${gym.name}</div>
                        ${gym.distance ? `<div class="gym-distance">${gym.distance}km</div>` : ''}
                    </div>
                    <div class="gym-address">${gym.address}</div>
                    <div class="gym-info">
                        <div class="gym-rating">
                            <span class="rating-stars">★</span>
                            ${gym.rating} (${gym.reviewCount})
                        </div>
                        <div class="gym-status ${gym.businessStatus === '营业中' ? 'status-open' : 'status-closed'}">
                            ${gym.businessStatus}
                        </div>
                    </div>
                    <div class="gym-tags">
                        ${gym.tags.map(tag => `
                            <span class="gym-tag ${tag === 'CrossFit认证' ? 'tag-crossfit' : (tag === '新手友好' ? 'tag-certified' : '')}">${tag}</span>
                        `).join('')}
                    </div>
                </div>
            `).join('');
            
            gymListContainer.innerHTML = gymCards;
        }

        // 搜索处理
        function handleSearch(keyword) {
            if (!keyword.trim()) {
                currentGyms = [...mockGyms];
            } else {
                currentGyms = mockGyms.filter(gym => 
                    gym.name.toLowerCase().includes(keyword.toLowerCase()) ||
                    gym.address.toLowerCase().includes(keyword.toLowerCase())
                );
            }
            renderGymList(currentGyms);
        }

        // 显示城市选择器
        function showCitySelector() {
            const cities = ['北京', '上海', '广州', '深圳', '杭州', '成都'];
            const cityList = cities.map(city => 
                `<div onclick="selectCity('${city}')" style="padding: 16px; border-bottom: 1px solid #eee; ${city === currentCity ? 'color: #ff4d4f; font-weight: 600;' : ''}">${city}</div>`
            ).join('');
            
            alert('城市选择器\n\n' + cities.join('\n'));
        }

        // 选择城市
        function selectCity(city) {
            currentCity = city;
            document.querySelector('.city-name').innerHTML = `${city}<div class="city-arrow"></div>`;
            
            // 模拟城市切换后的数据变化
            if (city === '上海') {
                currentGyms = [
                    {
                        ...mockGyms[0],
                        name: 'MobiLiF CrossFit上海站',
                        address: '上海市黄浦区南京东路步行街300号',
                        city: '上海',
                        distance: 0.8
                    },
                    {
                        ...mockGyms[1],
                        name: '上海力量工厂',
                        address: '上海市浦东新区陆家嘴环路1000号',
                        city: '上海',
                        distance: 2.1
                    }
                ];
            } else {
                currentGyms = [...mockGyms];
            }
            
            renderGymList(currentGyms);
        }

        // 显示筛选模态框
        function showFilterModal() {
            const filterOptions = `
筛选选项：

场馆类型：
□ CrossFit认证场馆
□ 综合训练馆  
□ 专项训练馆

课程类型：
□ CrossFit
□ Olympic Lifting
□ Powerlifting
□ Hyrox
□ Gymnastics
            `;
            
            alert(filterOptions);
            
            // 模拟筛选激活状态
            const filterBtn = document.getElementById('filterBtn');
            filterBtn.classList.toggle('active');
        }

        // 查看场馆详情
        function viewGymDetail(gymId) {
            const gym = currentGyms.find(g => g.id === gymId);
            if (gym) {
                alert(`场馆详情\n\n${gym.name}\n${gym.address}\n\n评分：${gym.rating}分\n营业状态：${gym.businessStatus}\n今日营业时间：${gym.todayHours}`);
            }
        }

        // 页面加载完成后初始化
        document.addEventListener('DOMContentLoaded', function() {
            renderGymList(currentGyms);
            
            // 模拟加载状态
            setTimeout(() => {
                console.log('页面加载完成，场馆数据已渲染');
            }, 500);
        });

        // 模拟下拉刷新
        let startY = 0;
        let currentY = 0;
        let isRefreshing = false;

        document.querySelector('.main-content').addEventListener('touchstart', (e) => {
            startY = e.touches[0].clientY;
        });

        document.querySelector('.main-content').addEventListener('touchmove', (e) => {
            currentY = e.touches[0].clientY;
            const scrollTop = e.target.scrollTop;
            
            if (scrollTop === 0 && currentY > startY + 50 && !isRefreshing) {
                isRefreshing = true;
                document.getElementById('gymList').innerHTML = '<div class="loading">刷新中...</div>';
                
                setTimeout(() => {
                    renderGymList(currentGyms);
                    isRefreshing = false;
                }, 1000);
            }
        });
    </script>
</body>
</html>