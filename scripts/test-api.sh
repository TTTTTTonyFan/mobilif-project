#!/bin/bash

# MobiLiF API 详细测试脚本
# 测试所有场馆列表相关的API接口

set -e

# 颜色定义
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# 测试配置
BASE_URL="http://localhost:3000"
TEST_TOKEN="test-token"
TIMEOUT=10

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

# HTTP请求函数
http_get() {
    local url="$1"
    local headers="$2"
    
    if [ -n "$headers" ]; then
        curl -s --max-time $TIMEOUT -H "$headers" "$url" 2>/dev/null || echo '{"error":"request_failed"}'
    else
        curl -s --max-time $TIMEOUT "$url" 2>/dev/null || echo '{"error":"request_failed"}'
    fi
}

# JSON解析函数
parse_json() {
    local json="$1"
    local key="$2"
    echo "$json" | grep -o "\"$key\":[^,}]*" | cut -d':' -f2 | tr -d '"' | tr -d ' '
}

# 检查JSON响应
check_response() {
    local response="$1"
    local expected_code="$2"
    local test_name="$3"
    
    if echo "$response" | grep -q '"error":"request_failed"'; then
        log_error "$test_name - 请求失败"
        return 1
    fi
    
    local code=$(parse_json "$response" "code")
    if [ "$code" = "$expected_code" ]; then
        log_success "$test_name - 响应正常 (code: $code)"
        return 0
    else
        log_error "$test_name - 响应异常 (code: $code, expected: $expected_code)"
        echo "Response: $response" | head -c 200
        echo ""
        return 1
    fi
}

# 性能测试
performance_test() {
    local url="$1"
    local test_name="$2"
    local headers="Authorization: Bearer $TEST_TOKEN"
    
    log_test "性能测试: $test_name"
    
    local start_time=$(date +%s%3N)
    local response=$(http_get "$url" "$headers")
    local end_time=$(date +%s%3N)
    
    local duration=$((end_time - start_time))
    
    if [ $duration -lt 200 ]; then
        log_success "$test_name - 响应时间: ${duration}ms (优秀)"
    elif [ $duration -lt 500 ]; then
        log_warning "$test_name - 响应时间: ${duration}ms (良好)"
    else
        log_error "$test_name - 响应时间: ${duration}ms (需要优化)"
    fi
    
    check_response "$response" "0" "$test_name"
}

# 开始测试
echo "🧪 MobiLiF API 详细测试"
echo "======================="
echo ""

# 检查服务状态
log_info "检查服务状态..."
if ! curl -s --max-time 5 "$BASE_URL/health" >/dev/null 2>&1; then
    log_error "后端服务未启动或无法访问: $BASE_URL"
    exit 1
fi
log_success "后端服务运行正常"
echo ""

# ========================================
# 1. 健康检查测试
# ========================================
echo "📋 健康检查测试"
echo "=================="

log_test "健康检查接口"
response=$(http_get "$BASE_URL/health")
if echo "$response" | grep -q '"status":"ok"'; then
    log_success "健康检查 - 服务状态正常"
else
    log_error "健康检查 - 服务状态异常"
    echo "$response"
fi
echo ""

# ========================================
# 2. 基础场馆列表测试
# ========================================
echo "🏢 基础场馆列表测试"
echo "=================="

# 测试默认场馆列表
log_test "获取默认场馆列表"
response=$(http_get "$BASE_URL/api/gyms" "Authorization: Bearer $TEST_TOKEN")
check_response "$response" "0" "默认场馆列表"

if echo "$response" | grep -q '"total":[0-9]'; then
    total=$(parse_json "$response" "total")
    log_info "总共找到 $total 个场馆"
fi

# 测试分页
log_test "分页功能测试"
response=$(http_get "$BASE_URL/api/gyms?page=1&pageSize=5" "Authorization: Bearer $TEST_TOKEN")
check_response "$response" "0" "分页功能"

# 测试城市筛选
log_test "城市筛选功能"
response=$(http_get "$BASE_URL/api/gyms?city=北京" "Authorization: Bearer $TEST_TOKEN")
check_response "$response" "0" "北京城市筛选"

response=$(http_get "$BASE_URL/api/gyms?city=上海" "Authorization: Bearer $TEST_TOKEN")
check_response "$response" "0" "上海城市筛选"

echo ""

# ========================================
# 3. 搜索功能测试
# ========================================
echo "🔍 搜索功能测试"
echo "==============="

# 关键词搜索
log_test "关键词搜索 - CrossFit"
response=$(http_get "$BASE_URL/api/gyms?keyword=CrossFit" "Authorization: Bearer $TEST_TOKEN")
check_response "$response" "0" "CrossFit关键词搜索"

log_test "关键词搜索 - 力量"
response=$(http_get "$BASE_URL/api/gyms?keyword=力量" "Authorization: Bearer $TEST_TOKEN")
check_response "$response" "0" "力量关键词搜索"

log_test "关键词搜索 - 不存在的关键词"
response=$(http_get "$BASE_URL/api/gyms?keyword=不存在的场馆xyz123" "Authorization: Bearer $TEST_TOKEN")
check_response "$response" "0" "不存在关键词搜索"

echo ""

# ========================================
# 4. 筛选功能测试
# ========================================
echo "🎯 筛选功能测试"
echo "==============="

# 场馆类型筛选
log_test "场馆类型筛选 - CrossFit认证"
response=$(http_get "$BASE_URL/api/gyms?gymType=crossfit_certified" "Authorization: Bearer $TEST_TOKEN")
check_response "$response" "0" "CrossFit认证场馆筛选"

log_test "场馆类型筛选 - 综合训练馆"
response=$(http_get "$BASE_URL/api/gyms?gymType=comprehensive" "Authorization: Bearer $TEST_TOKEN")
check_response "$response" "0" "综合训练馆筛选"

# 课程类型筛选
log_test "课程类型筛选 - CrossFit"
response=$(http_get "$BASE_URL/api/gyms?programs=CrossFit" "Authorization: Bearer $TEST_TOKEN")
check_response "$response" "0" "CrossFit课程筛选"

log_test "课程类型筛选 - Olympic Lifting"
response=$(http_get "$BASE_URL/api/gyms?programs=Olympic%20Lifting" "Authorization: Bearer $TEST_TOKEN")
check_response "$response" "0" "Olympic Lifting课程筛选"

log_test "课程类型筛选 - 多个课程"
response=$(http_get "$BASE_URL/api/gyms?programs=CrossFit,Olympic%20Lifting" "Authorization: Bearer $TEST_TOKEN")
check_response "$response" "0" "多课程类型筛选"

echo ""

# ========================================
# 5. 地理位置测试
# ========================================
echo "📍 地理位置测试"
echo "==============="

# 北京坐标测试
log_test "地理位置查询 - 北京"
response=$(http_get "$BASE_URL/api/gyms?lat=39.9042&lng=116.4074&radius=10" "Authorization: Bearer $TEST_TOKEN")
check_response "$response" "0" "北京地理位置查询"

# 上海坐标测试
log_test "地理位置查询 - 上海"
response=$(http_get "$BASE_URL/api/gyms?lat=31.2304&lng=121.4737&radius=10" "Authorization: Bearer $TEST_TOKEN")
check_response "$response" "0" "上海地理位置查询"

# 大范围查询
log_test "地理位置查询 - 大范围"
response=$(http_get "$BASE_URL/api/gyms?lat=39.9042&lng=116.4074&radius=50" "Authorization: Bearer $TEST_TOKEN")
check_response "$response" "0" "大范围地理位置查询"

echo ""

# ========================================
# 6. 排序功能测试
# ========================================
echo "📊 排序功能测试"
echo "==============="

log_test "排序 - 按距离"
response=$(http_get "$BASE_URL/api/gyms?lat=39.9042&lng=116.4074&sortBy=distance" "Authorization: Bearer $TEST_TOKEN")
check_response "$response" "0" "按距离排序"

log_test "排序 - 按评分"
response=$(http_get "$BASE_URL/api/gyms?sortBy=rating" "Authorization: Bearer $TEST_TOKEN")
check_response "$response" "0" "按评分排序"

log_test "排序 - 按名称"
response=$(http_get "$BASE_URL/api/gyms?sortBy=name" "Authorization: Bearer $TEST_TOKEN")
check_response "$response" "0" "按名称排序"

echo ""

# ========================================
# 7. 组合查询测试
# ========================================
echo "🔗 组合查询测试"
echo "==============="

log_test "组合查询 - 城市+关键词"
response=$(http_get "$BASE_URL/api/gyms?city=北京&keyword=CrossFit" "Authorization: Bearer $TEST_TOKEN")
check_response "$response" "0" "城市+关键词组合查询"

log_test "组合查询 - 位置+类型+课程"
response=$(http_get "$BASE_URL/api/gyms?lat=39.9042&lng=116.4074&gymType=crossfit_certified&programs=CrossFit" "Authorization: Bearer $TEST_TOKEN")
check_response "$response" "0" "位置+类型+课程组合查询"

log_test "组合查询 - 全部参数"
response=$(http_get "$BASE_URL/api/gyms?city=上海&keyword=CrossFit&gymType=crossfit_certified&programs=CrossFit&sortBy=rating&page=1&pageSize=10" "Authorization: Bearer $TEST_TOKEN")
check_response "$response" "0" "全参数组合查询"

echo ""

# ========================================
# 8. 城市和国家数据测试
# ========================================
echo "🌍 城市和国家数据测试"
echo "==================="

log_test "获取支持的城市列表"
response=$(http_get "$BASE_URL/api/gyms/cities" "Authorization: Bearer $TEST_TOKEN")
check_response "$response" "0" "城市列表接口"

log_test "获取支持的国家列表"
response=$(http_get "$BASE_URL/api/gyms/countries" "Authorization: Bearer $TEST_TOKEN")
check_response "$response" "0" "国家列表接口"

echo ""

# ========================================
# 9. 边界条件测试
# ========================================
echo "⚠️  边界条件测试"
echo "==============="

log_test "边界条件 - 无效坐标"
response=$(http_get "$BASE_URL/api/gyms?lat=999&lng=999" "Authorization: Bearer $TEST_TOKEN")
check_response "$response" "0" "无效坐标处理"

log_test "边界条件 - 负数页码"
response=$(http_get "$BASE_URL/api/gyms?page=-1" "Authorization: Bearer $TEST_TOKEN")
# 这个可能返回错误码，所以我们只检查是否有响应
if echo "$response" | grep -q '"code"'; then
    log_success "负数页码处理 - 有响应"
else
    log_error "负数页码处理 - 无响应"
fi

log_test "边界条件 - 过大的页面大小"
response=$(http_get "$BASE_URL/api/gyms?pageSize=1000" "Authorization: Bearer $TEST_TOKEN")
check_response "$response" "0" "过大页面大小处理"

log_test "边界条件 - 空关键词"
response=$(http_get "$BASE_URL/api/gyms?keyword=" "Authorization: Bearer $TEST_TOKEN")
check_response "$response" "0" "空关键词处理"

echo ""

# ========================================
# 10. 性能测试
# ========================================
echo "⚡ 性能测试"
echo "=========="

performance_test "$BASE_URL/api/gyms?city=北京" "基础查询性能"
performance_test "$BASE_URL/api/gyms?lat=39.9042&lng=116.4074&radius=10" "地理位置查询性能"
performance_test "$BASE_URL/api/gyms?keyword=CrossFit&gymType=crossfit_certified" "复合查询性能"

echo ""

# ========================================
# 11. 认证测试
# ========================================
echo "🔒 认证测试"
echo "=========="

log_test "无Token访问"
response=$(http_get "$BASE_URL/api/gyms")
# 检查是否返回认证错误
if echo "$response" | grep -q -E '(401|unauthorized|token)'; then
    log_success "无Token访问 - 正确拒绝"
else
    log_warning "无Token访问 - 可能允许匿名访问"
fi

log_test "无效Token访问"
response=$(http_get "$BASE_URL/api/gyms" "Authorization: Bearer invalid-token")
if echo "$response" | grep -q -E '(401|unauthorized|token)'; then
    log_success "无效Token访问 - 正确拒绝"
else
    log_warning "无效Token访问 - 可能允许匿名访问或Token验证较宽松"
fi

echo ""

# ========================================
# 测试总结
# ========================================
echo "📊 测试总结"
echo "=========="
echo "总测试数: $TOTAL_TESTS"
echo "通过: $PASSED_TESTS"
echo "失败: $FAILED_TESTS"

if [ $FAILED_TESTS -eq 0 ]; then
    echo -e "${GREEN}🎉 所有测试通过！${NC}"
    exit 0
else
    echo -e "${RED}❌ 有 $FAILED_TESTS 个测试失败${NC}"
    
    # 计算成功率
    SUCCESS_RATE=$((PASSED_TESTS * 100 / TOTAL_TESTS))
    echo "成功率: $SUCCESS_RATE%"
    
    if [ $SUCCESS_RATE -ge 80 ]; then
        echo -e "${YELLOW}⚠️  大部分功能正常，请检查失败的测试${NC}"
        exit 1
    else
        echo -e "${RED}💥 多个功能异常，需要重点检查${NC}"
        exit 2
    fi
fi