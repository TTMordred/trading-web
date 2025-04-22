# Cách Xác Định Volume Spike (Đột Biến Khối Lượng)

## Giới thiệu

Ứng dụng Volume Spike Tracker theo dõi các đột biến khối lượng giao dịch (volume spike) trên sàn Binance ở các khung thời gian khác nhau (15 phút, 1 giờ, 4 giờ, 1 ngày). Tài liệu này giải thích logic được sử dụng để xác định khi nào một đồng tiền có đột biến khối lượng giao dịch.

## Logic Xác Định Volume Spike

### 1. Thu thập dữ liệu lịch sử

- Ứng dụng lấy dữ liệu nến (candlestick) cho một cặp giao dịch cụ thể và khung thời gian (15m, 1h, 4h, hoặc 1d)
- Nó lấy 21 nến (được định nghĩa bởi `HISTORY_CANDLES + 1`), trong đó 20 nến là lịch sử và 1 nến là hiện tại

```typescript
// Số lượng nến để tính toán khối lượng trung bình
const HISTORY_CANDLES = 20;

// Lấy dữ liệu nến cho một cặp giao dịch và khung thời gian
const klines = await fetchKlineData(symbol, interval);
```

### 2. Tính toán khối lượng trung bình

- Ứng dụng lấy 20 nến lịch sử (không bao gồm nến hiện tại)
- Nó tính toán khối lượng trung bình bằng cách cộng tổng khối lượng của 20 nến này và chia cho 20

```typescript
// Nến hiện tại là nến mới nhất
const currentCandle = klines[klines.length - 1];
const currentVolume = parseFloat(currentCandle.volume);

// Tính toán khối lượng trung bình từ các nến lịch sử (không bao gồm nến hiện tại)
const historicalCandles = klines.slice(0, klines.length - 1);
const totalHistoricalVolume = historicalCandles.reduce(
  (sum, candle) => sum + parseFloat(candle.volume),
  0
);
const averageVolume = totalHistoricalVolume / historicalCandles.length;
```

### 3. Phát hiện đột biến

- Ứng dụng so sánh khối lượng của nến hiện tại với khối lượng trung bình đã tính
- Nếu khối lượng hiện tại ít nhất gấp 2 lần (được định nghĩa bởi `VOLUME_SPIKE_THRESHOLD`) lớn hơn khối lượng trung bình, nó được coi là một đột biến khối lượng

```typescript
// Ngưỡng cho đột biến khối lượng (ví dụ: 2 có nghĩa là khối lượng hiện tại gấp 2 lần trung bình)
const VOLUME_SPIKE_THRESHOLD = 2;

// Kiểm tra nếu khối lượng hiện tại vượt quá ngưỡng
if (currentVolume >= averageVolume * VOLUME_SPIKE_THRESHOLD) {
  // Đây là một đột biến khối lượng
  // ...
}
```

### 4. Thông tin bổ sung

- Đối với mỗi đột biến được phát hiện, ứng dụng cũng lấy thông tin thay đổi giá trong 24 giờ
- Nó tính toán phần trăm tăng của khối lượng hiện tại so với khối lượng trung bình:

```typescript
percentageIncrease: (currentVolume / averageVolume - 1) * 100
```

### 5. Sắp xếp kết quả

- Tất cả các đột biến khối lượng được phát hiện được sắp xếp từ cao đến thấp theo phần trăm tăng
- Điều này giúp các nhà giao dịch nhanh chóng xác định các bất thường khối lượng đáng kể nhất

```typescript
// Lọc ra các kết quả null và sắp xếp theo phần trăm tăng
const volumeSpikes = volumeSpikesResults
  .filter((result): result is VolumeSpikeData => result !== null)
  .sort((a, b) => b.percentageIncrease - a.percentageIncrease);
```

## Tóm tắt

Nói một cách đơn giản, một đột biến khối lượng được phát hiện khi:
- Khối lượng giao dịch hiện tại ít nhất gấp đôi (2x) khối lượng trung bình của 20 nến trước đó
- Tỷ lệ giữa khối lượng hiện tại và khối lượng trung bình càng cao, đột biến càng đáng kể

Phương pháp này giúp xác định hoạt động giao dịch bất thường có thể chỉ ra các biến động giá tiềm năng hoặc sự quan tâm gia tăng của thị trường đối với một loại tiền điện tử cụ thể.
