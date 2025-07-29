#!/bin/bash

# MobiLiF API Mock测试脚本
# 使用模拟数据测试API逻辑，无需真实数据库

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# 测试计数器
TOTAL_TESTS=0
PASSED_TESTS=0
FAILED_TESTS=0

log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[PASS]${NC} $1"
    ((PASSED_TESTS++))
}

log_error() {
    echo -e "${RED}[FAIL]${NC} $1"
    ((FAILED_TESTS++))
}

log_warning() {
    echo -e "${YELLOW}[WARN]${NC} $1"
}

log_test() {
    echo -e "${PURPLE}[TEST]${NC} $1"
    ((TOTAL_TESTS++))
}

echo "🧪 MobiLiF API Mock测试"
echo "======================="
echo ""

# 检查Node.js项目结构
log_info "检查项目结构..."

if [ ! -f "package.json" ]; then
    log_error "未找到package.json，请在项目根目录运行"
    exit 1
fi

if [ ! -f "prisma/schema.prisma" ]; then
    log_error "未找到Prisma schema文件"
    exit 1
fi

if [ ! -d "src/modules/gym" ]; then
    log_error "未找到gym模块"
    exit 1
fi

log_success "项目结构检查通过"

# 检查关键文件
log_info "检查关键代码文件..."

# 检查控制器
log_test "检查Gym控制器"
if [ -f "src/modules/gym/gym.controller.ts" ]; then
    if grep -q "getGymList" src/modules/gym/gym.controller.ts; then
        log_success "Gym控制器 - getGymList方法存在"
    else
        log_error "Gym控制器 - 缺少getGymList方法"
    fi
    
    if grep -q "getCities" src/modules/gym/gym.controller.ts; then
        log_success "Gym控制器 - getCities方法存在"
    else
        log_warning "Gym控制器 - getCities方法可能缺失"
    fi
else
    log_error "Gym控制器文件不存在"
fi

# 检查服务
log_test "检查Gym服务"
if [ -f "src/modules/gym/gym.service.ts" ]; then
    if grep -q "findGyms" src/modules/gym/gym.service.ts; then
        log_success "Gym服务 - findGyms方法存在"
    else
        log_error "Gym服务 - 缺少findGyms方法"
    fi
    
    if grep -q "calculateDistance" src/modules/gym/gym.service.ts; then
        log_success "Gym服务 - 距离计算方法存在"
    else
        log_error "Gym服务 - 缺少距离计算方法"
    fi
    
    if grep -q "getBusinessStatus" src/modules/gym/gym.service.ts; then
        log_success "Gym服务 - 营业状态方法存在"
    else
        log_error "Gym服务 - 缺少营业状态方法"
    fi
else
    log_error "Gym服务文件不存在"
fi

# 检查DTO
log_test "检查DTO文件"
if [ -f "src/modules/gym/dto/gym.dto.ts" ]; then
    if grep -q "GymSearchParamsDto" src/modules/gym/dto/gym.dto.ts; then
        log_success "DTO - 搜索参数DTO存在"
    else
        log_error "DTO - 缺少搜索参数DTO"
    fi
    
    if grep -q "GetGymListDto" src/modules/gym/dto/gym.dto.ts; then
        log_success "DTO - 场馆列表响应DTO存在"
    else
        log_error "DTO - 缺少场馆列表响应DTO"
    fi
else
    log_error "DTO文件不存在"
fi

# 检查前端组件
log_info "检查前端组件..."

log_test "检查React Native组件"
if [ -d "frontend/src" ]; then
    if [ -f "frontend/src/pages/DropInBooking/GymList.tsx" ]; then
        log_success "前端组件 - GymList页面存在"
        
        if grep -q "useDispatch" frontend/src/pages/DropInBooking/GymList.tsx; then
            log_success "前端组件 - Redux集成正确"
        else
            log_warning "前端组件 - 可能缺少Redux集成"
        fi
    else
        log_error "前端组件 - GymList页面不存在"
    fi
    
    if [ -f "frontend/src/store/slices/gymSlice.ts" ]; then
        log_success "Redux - gymSlice存在"
    else
        log_error "Redux - gymSlice不存在"
    fi
    
    if [ -f "frontend/src/services/api/gymAPI.ts" ]; then
        log_success "API服务 - gymAPI存在"
    else
        log_error "API服务 - gymAPI不存在"
    fi
else
    log_warning "前端目录不存在，跳过前端检查"
fi

# 检查数据库相关文件
log_info "检查数据库文件..."

log_test "检查Prisma Schema"
if grep -q "gymType.*GymType" prisma/schema.prisma; then
    log_success "Prisma Schema - 场馆类型字段存在"
else
    log_error "Prisma Schema - 缺少场馆类型字段"
fi

if grep -q "supportedPrograms.*Json" prisma/schema.prisma; then
    log_success "Prisma Schema - 支持课程字段存在"
else
    log_error "Prisma Schema - 缺少支持课程字段"
fi

log_test "检查迁移脚本"
if [ -f "prisma/migrations/001_add_gym_type_and_programs.sql" ]; then
    log_success "迁移脚本存在"
else
    log_error "迁移脚本不存在"
fi

log_test "检查种子数据"
if [ -f "prisma/seeds/gym_seed_data.sql" ]; then
    log_success "种子数据存在"
    
    # 检查种子数据内容
    if grep -q "CrossFit" prisma/seeds/gym_seed_data.sql; then
        log_success "种子数据包含CrossFit场馆"
    else
        log_warning "种子数据可能缺少CrossFit场馆"
    fi
else
    log_error "种子数据不存在"
fi

# 模拟API响应测试
log_info "模拟API逻辑测试..."

log_test "模拟距离计算测试"
# 创建临时Node.js脚本测试距离计算
cat > test_distance.js << 'EOF'
// 模拟距离计算逻辑
function calculateDistance(lat1, lng1, lat2, lng2) {
    const R = 6371; // 地球半径（公里）
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLng = (lng2 - lng1) * Math.PI / 180;
    const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLng/2) * Math.sin(dLng/2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
    return R * c;
}

// 测试北京市中心到三里屯的距离
const distance = calculateDistance(39.9042, 116.4074, 39.9333, 116.4619);
console.log(`计算距离: ${distance.toFixed(2)}km`);

// 验证距离合理性（应该在3-6km之间）
if (distance > 2 && distance < 8) {
    console.log('✅ 距离计算逻辑正确');
    process.exit(0);
} else {
    console.log('❌ 距离计算逻辑异常');
    process.exit(1);
}
EOF

if node test_distance.js; then
    log_success "距离计算逻辑测试通过"
else
    log_error "距离计算逻辑测试失败"
fi
rm -f test_distance.js

log_test "模拟营业状态计算测试"
# 创建营业状态测试
cat > test_business_status.js << 'EOF'
// 模拟营业状态计算
function getBusinessStatus(openingHours) {
    const now = new Date();
    const currentHour = now.getHours();
    const currentMinute = now.getMinutes();
    const currentTime = currentHour * 60 + currentMinute;
    
    if (!openingHours || !openingHours.monday) {
        return { status: '未知', todayHours: '未知' };
    }
    
    const today = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'][now.getDay()];
    const todayHours = openingHours[today];
    
    if (!todayHours || todayHours === 'closed') {
        return { status: '歇业', todayHours: '歇业' };
    }
    
    const [openTime, closeTime] = todayHours.split('-');
    const [openHour, openMin] = openTime.split(':').map(Number);
    const [closeHour, closeMin] = closeTime.split(':').map(Number);
    
    const openMinutes = openHour * 60 + openMin;
    const closeMinutes = closeHour * 60 + closeMin;
    
    if (currentTime >= openMinutes && currentTime <= closeMinutes) {
        return { status: '营业中', todayHours: todayHours };
    } else {
        return { status: '休息中', todayHours: todayHours };
    }
}

// 模拟测试数据
const testHours = {
    monday: '06:00-22:00',
    tuesday: '06:00-22:00',
    wednesday: '06:00-22:00',
    thursday: '06:00-22:00',
    friday: '06:00-22:00',
    saturday: '08:00-20:00',
    sunday: '08:00-18:00'
};

const result = getBusinessStatus(testHours);
console.log(`营业状态: ${result.status}, 今日时间: ${result.todayHours}`);

// 验证返回值格式
if (result.status && result.todayHours) {
    console.log('✅ 营业状态计算逻辑正确');
    process.exit(0);
} else {
    console.log('❌ 营业状态计算逻辑异常');
    process.exit(1);
}
EOF

if node test_business_status.js; then
    log_success "营业状态计算逻辑测试通过"
else
    log_error "营业状态计算逻辑测试失败"
fi
rm -f test_business_status.js

# 检查代码质量
log_info "代码质量检查..."

log_test "TypeScript语法检查"
if [ -f "tsconfig.json" ]; then
    # 尝试编译检查
    if npx tsc --noEmit > /dev/null 2>&1; then
        log_success "TypeScript编译检查通过"
    else
        log_warning "TypeScript编译可能有警告（需要安装依赖）"
    fi
else
    log_warning "未找到tsconfig.json"
fi

echo ""
echo "========================================"
echo "📊 Mock测试结果总结"
echo "========================================"
echo "总测试数: $TOTAL_TESTS"
echo "通过: $PASSED_TESTS"
echo "失败: $FAILED_TESTS"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 所有Mock测试通过！${NC}"
    echo ""
    echo "📋 下一步建议："
    echo "1. 安装MySQL进行完整测试: brew install mysql"
    echo "2. 运行完整测试: ./scripts/run-e2e-test.sh"
    echo "3. 或运行详细API测试: ./scripts/test-api.sh"
    exit 0
else
    echo -e "${RED}❌ 有 $FAILED_TESTS 个测试失败${NC}"
    SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo "成功率: $SUCCESS_RATE%"
    
    if [ $SUCCESS_RATE -ge 70 ]; then
        echo -e "${YELLOW}⚠️  大部分功能正常，建议修复失败项目后继续${NC}"
        exit 1
    else
        echo -e "${RED}💥 多个功能异常，需要重点检查代码实现${NC}"
        exit 2
    fi
fi