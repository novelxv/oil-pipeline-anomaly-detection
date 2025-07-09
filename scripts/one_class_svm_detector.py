import numpy as np
import pandas as pd
from sklearn.svm import OneClassSVM
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import classification_report, confusion_matrix
import matplotlib.pyplot as plt
import seaborn as sns
from datetime import datetime
import joblib

class PipelineAnomalyDetector:
    """
    One-Class SVM implementation for oil pipeline anomaly detection
    Based on the research paper methodology
    """
    
    def __init__(self, kernel='rbf', nu=0.05, gamma='auto'):
        self.kernel = kernel
        self.nu = nu
        self.gamma = gamma
        self.scaler = StandardScaler()
        self.model = None
        self.is_trained = False
        
    def create_sliding_windows(self, data, window_size=400, step_size=1):
        """
        Create sliding windows from time series data
        """
        print(f"Creating sliding windows (size={window_size}, step={step_size})")
        
        windows = []
        labels = []
        
        for i in range(0, len(data) - window_size + 1, step_size):
            window = data.iloc[i:i+window_size]
            
            # Extract features from window
            features = self.extract_window_features(window)
            windows.append(features)
            
            # Label window as anomaly if any sample in window is anomaly
            has_anomaly = window['is_anomaly'].any()
            labels.append(has_anomaly)
        
        return np.array(windows), np.array(labels)
    
    def extract_window_features(self, window):
        """
        Extract statistical features from a time window
        """
        pressure = window['pressure_mpa'].values
        frequency = window['frequency_hz'].values
        
        features = [
            # Pressure features
            np.mean(pressure),
            np.std(pressure),
            np.min(pressure),
            np.max(pressure),
            np.median(pressure),
            np.percentile(pressure, 25),
            np.percentile(pressure, 75),
            
            # Frequency features
            np.mean(frequency),
            np.std(frequency),
            np.min(frequency),
            np.max(frequency),
            np.median(frequency),
            
            # Trend features
            np.polyfit(range(len(pressure)), pressure, 1)[0],  # Pressure slope
            np.polyfit(range(len(frequency)), frequency, 1)[0],  # Frequency slope
            
            # Variability features
            np.var(pressure),
            np.var(frequency),
            
            # Cross-correlation
            np.corrcoef(pressure, frequency)[0, 1] if len(pressure) > 1 else 0
        ]
        
        return features
    
    def train(self, data, window_size=400):
        """
        Train the One-Class SVM on normal pipeline data
        """
        print("Training One-Class SVM...")
        
        # Filter only normal data for training
        normal_data = data[data['anomaly_type'] == 'normal'].copy()
        print(f"Training on {len(normal_data):,} normal samples")
        
        # Create sliding windows
        X_windows, _ = self.create_sliding_windows(normal_data, window_size)
        
        # Handle NaN values
        X_windows = np.nan_to_num(X_windows)
        
        # Normalize features
        X_scaled = self.scaler.fit_transform(X_windows)
        
        # Train One-Class SVM
        self.model = OneClassSVM(
            kernel=self.kernel,
            nu=self.nu,
            gamma=self.gamma
        )
        
        print(f"Training on {X_scaled.shape[0]} windows with {X_scaled.shape[1]} features")
        self.model.fit(X_scaled)
        
        self.is_trained = True
        print("Training completed!")
        
        return self
    
    def predict(self, data, window_size=400):
        """
        Predict anomalies in pipeline data
        """
        if not self.is_trained:
            raise ValueError("Model must be trained before prediction")
        
        print("Predicting anomalies...")
        
        # Create sliding windows
        X_windows, y_true = self.create_sliding_windows(data, window_size)
        
        # Handle NaN values
        X_windows = np.nan_to_num(X_windows)
        
        # Normalize features
        X_scaled = self.scaler.transform(X_windows)
        
        # Predict (1 = normal, -1 = anomaly)
        predictions = self.model.predict(X_scaled)
        
        # Convert to boolean (True = anomaly)
        anomaly_predictions = predictions == -1
        
        return anomaly_predictions, y_true
    
    def evaluate(self, data, window_size=400):
        """
        Evaluate model performance
        """
        predictions, y_true = self.predict(data, window_size)
        
        # Calculate metrics
        from sklearn.metrics import precision_score, recall_score, f1_score
        
        precision = precision_score(y_true, predictions)
        recall = recall_score(y_true, predictions)
        f1 = f1_score(y_true, predictions)
        
        results = {
            'precision': precision,
            'recall': recall,
            'f1_score': f1,
            'total_windows': len(predictions),
            'predicted_anomalies': np.sum(predictions),
            'true_anomalies': np.sum(y_true)
        }
        
        print(f"\nModel Performance:")
        print(f"Precision: {precision:.3f}")
        print(f"Recall: {recall:.3f}")
        print(f"F1-Score: {f1:.3f}")
        print(f"Total windows: {len(predictions):,}")
        print(f"Predicted anomalies: {np.sum(predictions):,}")
        print(f"True anomalies: {np.sum(y_true):,}")
        
        return results
    
    def save_model(self, filepath):
        """
        Save trained model
        """
        if not self.is_trained:
            raise ValueError("No trained model to save")
        
        model_data = {
            'model': self.model,
            'scaler': self.scaler,
            'kernel': self.kernel,
            'nu': self.nu,
            'gamma': self.gamma
        }
        
        joblib.dump(model_data, filepath)
        print(f"Model saved to {filepath}")
    
    def load_model(self, filepath):
        """
        Load trained model
        """
        model_data = joblib.load(filepath)
        
        self.model = model_data['model']
        self.scaler = model_data['scaler']
        self.kernel = model_data['kernel']
        self.nu = model_data['nu']
        self.gamma = model_data['gamma']
        self.is_trained = True
        
        print(f"Model loaded from {filepath}")

def run_ocsvm_analysis():
    """
    Run the complete One-Class SVM analysis
    """
    print("Starting One-Class SVM Analysis for Oil Pipeline Anomaly Detection")
    print("=" * 70)
    
    # Load data
    try:
        data = pd.read_csv('pipeline_monitoring_data.csv')
        print(f"Loaded {len(data):,} samples from pipeline data")
    except FileNotFoundError:
        print("Error: pipeline_monitoring_data.csv not found. Please run generate_pipeline_data.py first.")
        return
    
    # Convert timestamp
    data['timestamp'] = pd.to_datetime(data['timestamp'])
    
    # Split data (80% train, 20% test)
    split_point = int(len(data) * 0.8)
    train_data = data[:split_point].copy()
    test_data = data[split_point:].copy()
    
    print(f"Training data: {len(train_data):,} samples")
    print(f"Test data: {len(test_data):,} samples")
    
    # Test different window sizes (as mentioned in the paper)
    window_sizes = [80, 200, 400, 600, 800, 1000, 1200]
    results = []
    
    for window_size in window_sizes:
        print(f"\nTesting window size: {window_size} seconds")
        print("-" * 40)
        
        # Initialize detector
        detector = PipelineAnomalyDetector(kernel='rbf', nu=0.05, gamma='auto')
        
        # Train model
        detector.train(train_data, window_size=window_size)
        
        # Evaluate on test data
        performance = detector.evaluate(test_data, window_size=window_size)
        performance['window_size'] = window_size
        results.append(performance)
    
    # Create results DataFrame
    results_df = pd.DataFrame(results)
    
    # Save results
    results_df.to_csv('ocsvm_results.csv', index=False)
    
    # Visualize results
    plt.figure(figsize=(15, 10))
    
    plt.subplot(2, 2, 1)
    plt.plot(results_df['window_size'], results_df['precision'], 'bo-', label='Precision')
    plt.plot(results_df['window_size'], results_df['recall'], 'ro-', label='Recall')
    plt.plot(results_df['window_size'], results_df['f1_score'], 'go-', label='F1-Score')
    plt.xlabel('Window Size (seconds)')
    plt.ylabel('Performance')
    plt.title('Performance vs Window Size')
    plt.legend()
    plt.grid(True, alpha=0.3)
    
    plt.subplot(2, 2, 2)
    plt.bar(results_df['window_size'], results_df['predicted_anomalies'])
    plt.xlabel('Window Size (seconds)')
    plt.ylabel('Predicted Anomalies')
    plt.title('Predicted Anomalies by Window Size')
    plt.grid(True, alpha=0.3)
    
    # Train final model with optimal window size (400s as per paper)
    print(f"\nTraining final model with optimal window size (400s)")
    final_detector = PipelineAnomalyDetector(kernel='rbf', nu=0.05, gamma='auto')
    final_detector.train(train_data, window_size=400)
    
    # Final evaluation
    final_results = final_detector.evaluate(test_data, window_size=400)
    
    # Save final model
    final_detector.save_model('ocsvm_pipeline_model.pkl')
    
    # Detailed analysis on sample data
    sample_data = test_data.head(10000)  # First 10k samples for visualization
    predictions, y_true = final_detector.predict(sample_data, window_size=400)
    
    plt.subplot(2, 1, 2)
    time_indices = range(len(predictions))
    plt.plot(time_indices, predictions.astype(int), 'r-', alpha=0.7, label='Predicted Anomalies')
    plt.plot(time_indices, y_true.astype(int), 'b-', alpha=0.5, label='True Anomalies')
    plt.xlabel('Window Index')
    plt.ylabel('Anomaly (1=Yes, 0=No)')
    plt.title('Anomaly Detection Results (Sample)')
    plt.legend()
    plt.grid(True, alpha=0.3)
    
    plt.tight_layout()
    plt.savefig('ocsvm_analysis_results.png', dpi=300, bbox_inches='tight')
    plt.show()
    
    print(f"\nFinal Model Performance:")
    print(f"Precision: {final_results['precision']:.3f}")
    print(f"Recall: {final_results['recall']:.3f}")
    print(f"F1-Score: {final_results['f1_score']:.3f}")
    
    return final_detector, results_df

if __name__ == "__main__":
    detector, results = run_ocsvm_analysis()
