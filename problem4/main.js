// Cách 1: Sử dụng công thức toán học (Gauss formula)
// Độ phức tạp thời gian: O(1) - Constant time
// Độ phức tạp không gian: O(1) - Constant space
var sum_to_n_a = function(n) {
    return (n * (n + 1)) / 2;
};

// Cách 2: Sử dụng đệ quy
// Độ phức tạp thời gian: O(n) - Linear time
// Độ phức tạp không gian: O(n) - Linear space
var sum_to_n_b = function(n) {
    if (n <= 0) return 0;
    if (n === 1) return 1;
    return n + sum_to_n_b(n - 1);
};

// Cách 3: Sử dụng thuật toán tối ưu - Dùng phép dịch bit để tối ưu phép chia cho 2
// Độ phức tạp thời gian: O(1) - Constant time
// Độ phức tạp không gian: O(1) - Constant space
var sum_to_n_c = function(n) {
    if (n <= 0) return 0;
    if (n % 2 === 0) {
        return (n >> 1) * (n + 1);
    } else {
        return n * ((n + 1) >> 1);
    }
};


// Warm-up để ổn định performance
console.log("WARM-UP --> để ổn định performance");
for (let i = 0; i < 500; i++) {
    sum_to_n_a(100);
    sum_to_n_b(100);
    sum_to_n_c(100);
}

console.log("SO SÁNH HIỆU SUẤT");
const testValue = 1000;

const start1 = performance.now();
const result1 = sum_to_n_a(testValue);
const end1 = performance.now();

const start2 = performance.now();
const result2 = sum_to_n_b(testValue);
const end2 = performance.now();

const start3 = performance.now();
const result3 = sum_to_n_c(testValue);
const end3 = performance.now();

console.log(`Test với n = ${testValue}:`);
console.log(`Cách 1: ${result1} (${(end1 - start1).toFixed(6)}ms)`);
console.log(`Cách 2: ${result2} (${(end2 - start2).toFixed(6)}ms)`);
console.log(`Cách 3: ${result3} (${(end3 - start3).toFixed(6)}ms)`);

