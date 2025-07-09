import numpy as np
import pandas as pd
from sklearn.cluster import AgglomerativeClustering
from sklearn.preprocessing import StandardScaler
from sklearn.metrics import silhouette_score
import matplotlib.pyplot as plt
import seaborn as sns
from scipy.cluster.hierarchy import dendrogram, linkage
from scipy.spatial.distance import pdist
import joblib

class AnomalyPatternClustering:
    """
    Hierarchical clustering for distinguishing true and false anomalies
    Based on the research paper methodology
    """
    
    def __init__(self, n_clusters=10, linkage='ward', distance_metric='euclidean'):
        self.n_clusters = n_clusters
        self.linkage = linkage
        self.distance_metric = distance_metric
        self.scaler = StandardScaler()
        self.clustering_model = None
        self.is_fitted = False
        
    def extract_anomaly_features(self, anomaly_data):
        """
        Extract features from anomaly patterns
        """
        features = []
        
        for _, group in anomaly_data.groupby('anomaly_group'):
            if len(group) < 2:
                continue
                
            pressure = group['pressure_mpa'].values
            frequency = group['frequency_hz'].values
            
            # Morphological features
            feature_vector = [
                # Pressure pattern features
                np.mean(pressure),
                np.std(pressure),
                np.min(pressure),
                np.max(pressure),
                np.ptp(pressure),  # Peak-to-peak
                
                # Frequency pattern features
                np.mean(frequency),
                np.std(frequency),
                np.var(frequency),
                
                # Duration and intensity
                len(group),  # Duration in samples
                np.sum(np.abs(np.diff(pressure))),  # Total pressure variation
                
                # Gradient features
                np.mean(np.gradient(pressure)),
                np.std(np.gradient(pressure)),
                np.mean(np.gradient(frequency)),
                
                # Cross-correlation
                np.corrcoef(pressure, frequency)[0, 1] if len(pressure) > 1 else 0,
                
                # Shape characteristics
                np.trapz(pressure),  # Area under pressure curve
                np.argmin(pressure) / len(pressure) if len(pressure) > 0 else 0,  # Position of minimum
            ]
            
            features.append(feature_vector)
        
        return np.array(features)
    
    def identify_anomaly_groups(self, data, min_gap=10):
        """
        Group consecutive anomaly points
        """
        anomaly_data = data[data['is_anomaly'] == True].copy()
        anomaly_data = anomaly_data.sort_values('timestamp')
        
        # Identify groups of consecutive anomalies
        anomaly_data['time_diff'] = anomaly_data['timestamp'].diff().dt.total_seconds()
        anomaly_data['new_group'] = (anomaly_data['time_diff'] > min_gap) | anomaly_data['time_diff'].isna()
        anomaly_data['anomaly_group'] = anomaly_data['new_group'].cumsum()
        
        return anomaly_data
    
    def fit_clustering(self, data):
        """
        Fit hierarchical clustering on anomaly patterns
        """
        print("Performing hierarchical clustering on anomaly patterns...")
        
        # Identify anomaly groups
        anomaly_data = self.identify_anomaly_groups(data)
        
        if len(anomaly_data) == 0:
            print("No anomalies found in data")
            return self
        
        print(f"Found {anomaly_data['anomaly_group'].nunique()} anomaly groups")
        
        # Extract features from anomaly patterns
        features = self.extract_anomaly_features(anomaly_data)
        
        if len(features) == 0:
            print("No valid features extracted")
            return self
        
        # Handle NaN values
        features = np.nan_to_num(features)
        
        # Normalize features
        features_scaled = self.scaler.fit_transform(features)
        
        # Perform hierarchical clustering
        self.clustering_model = AgglomerativeClustering(
            n_clusters=self.n_clusters,
            linkage=self.linkage
        )
        
        cluster_labels = self.clustering_model.fit_predict(features_scaled)
        
        # Store results
        self.features = features
        self.features_scaled = features_scaled
        self.cluster_labels = cluster_labels
        self.anomaly_data = anomaly_data
        self.is_fitted = True
        
        print(f"Clustering completed with {self.n_clusters} clusters")
        
        return self
    
    def identify_leak_cluster(self, data):
        """
        Identify which cluster contains leak anomalies
        """
        if not self.is_fitted:
            raise ValueError("Clustering must be fitted first")
        
        # Get leak events from data
        leak_data = data[data['anomaly_type'] == 'leak']
        
        if len(leak_data) == 0:
            print("No leak events found in data")
            return None
        
        # Find which cluster contains most leak events
        leak_groups = self.identify_anomaly_groups(leak_data)
        
        cluster_leak_counts = {}
        for cluster_id in range(self.n_clusters):
            cluster_leak_counts[cluster_id] = 0
        
        # Count leak events in each cluster
        for group_id in leak_groups['anomaly_group'].unique():
            # Find corresponding cluster for this group
            group_idx = np.where(self.anomaly_data['anomaly_group'] == group_id)[0]
            if len(group_idx) > 0:
                # Find cluster assignment for this group
                feature_idx = list(self.anomaly_data['anomaly_group'].unique()).index(group_id)
                if feature_idx < len(self.cluster_labels):
                    cluster_id = self.cluster_labels[feature_idx]
                    cluster_leak_counts[cluster_id] += len(group_idx)
        
        # Find cluster with most leak events
        leak_cluster = max(cluster_leak_counts, key=cluster_leak_counts.get)
        
        print(f"Leak cluster identified: Cluster {leak_cluster}")
        print(f"Leak events per cluster: {cluster_leak_counts}")
        
        return leak_cluster
    
    def calculate_false_positive_reduction(self, data):
        """
        Calculate false positive reduction rate
        """
        if not self.is_fitted:
            raise ValueError("Clustering must be fitted first")
        
        leak_cluster = self.identify_leak_cluster(data)
        
        if leak_cluster is None:
            return 0.0
        
        # Count total anomalies and those in leak cluster
        total_anomaly_groups = len(self.cluster_labels)
        leak_cluster_groups = np.sum(self.cluster_labels == leak_cluster)
        false_positive_groups = total_anomaly_groups - leak_cluster_groups
        
        false_positive_reduction = (false_positive_groups / total_anomaly_groups) * 100
        
        print(f"Total anomaly groups: {total_anomaly_groups}")
        print(f"Leak cluster groups: {leak_cluster_groups}")
        print(f"False positive groups removed: {false_positive_groups}")
        print(f"False positive reduction: {false_positive_reduction:.2f}%")
        
        return false_positive_reduction
    
    def visualize_clusters(self):
        """
        Visualize clustering results
        """
        if not self.is_fitted:
            raise ValueError("Clustering must be fitted first")
        
        plt.figure(figsize=(15, 10))
        
        # Plot 1: Dendrogram
        plt.subplot(2, 2, 1)
        linkage_matrix = linkage(self.features_scaled, method=self.linkage)
        dendrogram(linkage_matrix)
        plt.title('Hierarchical Clustering Dendrogram')
        plt.xlabel('Sample Index')
        plt.ylabel('Distance')
        
        # Plot 2: Cluster distribution
        plt.subplot(2, 2, 2)
        unique_labels, counts = np.unique(self.cluster_labels, return_counts=True)
        plt.bar(unique_labels, counts)
        plt.xlabel('Cluster ID')
        plt.ylabel('Number of Anomaly Groups')
        plt.title('Cluster Size Distribution')
        plt.grid(True, alpha=0.3)
        
        # Plot 3: Feature space (first 2 principal components)
        from sklearn.decomposition import PCA
        pca = PCA(n_components=2)
        features_2d = pca.fit_transform(self.features_scaled)
        
        plt.subplot(2, 2, 3)
        scatter = plt.scatter(features_2d[:, 0], features_2d[:, 1], 
                            c=self.cluster_labels, cmap='tab10', alpha=0.7)
        plt.xlabel(f'PC1 ({pca.explained_variance_ratio_[0]:.2%} variance)')
        plt.ylabel(f'PC2 ({pca.explained_variance_ratio_[1]:.2%} variance)')
        plt.title('Clusters in Feature Space (PCA)')
        plt.colorbar(scatter)
        
        # Plot 4: Silhouette analysis
        plt.subplot(2, 2, 4)
        silhouette_avg = silhouette_score(self.features_scaled, self.cluster_labels)
        
        from sklearn.metrics import silhouette_samples
        sample_silhouette_values = silhouette_samples(self.features_scaled, self.cluster_labels)
        
        y_lower = 10
        for i in range(self.n_clusters):
            cluster_silhouette_values = sample_silhouette_values[self.cluster_labels == i]
            cluster_silhouette_values.sort()
            
            size_cluster_i = cluster_silhouette_values.shape[0]
            y_upper = y_lower + size_cluster_i
            
            color = plt.cm.nipy_spectral(float(i) / self.n_clusters)
            plt.fill_betweenx(np.arange(y_lower, y_upper),
                            0, cluster_silhouette_values,
                            facecolor=color, edgecolor=color, alpha=0.7)
            
            y_lower = y_upper + 10
        
        plt.axvline(x=silhouette_avg, color="red", linestyle="--", 
                   label=f'Average Score: {silhouette_avg:.3f}')
        plt.xlabel('Silhouette Coefficient Values')
        plt.ylabel('Cluster Label')
        plt.title('Silhouette Analysis')
        plt.legend()
        
        plt.tight_layout()
        plt.savefig('clustering_analysis.png', dpi=300, bbox_inches='tight')
        plt.show()
        
        return silhouette_avg
    
    def save_model(self, filepath):
        """
        Save clustering model
        """
        if not self.is_fitted:
            raise ValueError("No fitted model to save")
        
        model_data = {
            'clustering_model': self.clustering_model,
            'scaler': self.scaler,
            'n_clusters': self.n_clusters,
            'linkage': self.linkage,
            'distance_metric': self.distance_metric,
            'features': self.features,
            'features_scaled': self.features_scaled,
            'cluster_labels': self.cluster_labels
        }
        
        joblib.dump(model_data, filepath)
        print(f"Clustering model saved to {filepath}")

def optimize_cluster_number(data, max_clusters=25):
    """
    Find optimal number of clusters using silhouette analysis
    """
    print("Optimizing number of clusters...")
    
    cluster_range = range(5, max_clusters + 1)
    silhouette_scores = []
    
    for n_clusters in cluster_range:
        print(f"Testing {n_clusters} clusters...")
        
        clustering = AnomalyPatternClustering(n_clusters=n_clusters)
        clustering.fit_clustering(data)
        
        if clustering.is_fitted and len(clustering.features_scaled) > n_clusters:
            score = silhouette_score(clustering.features_scaled, clustering.cluster_labels)
            silhouette_scores.append(score)
        else:
            silhouette_scores.append(0)
    
    # Find optimal number of clusters
    optimal_clusters = cluster_range[np.argmax(silhouette_scores)]
    
    # Plot results
    plt.figure(figsize=(10, 6))
    plt.plot(cluster_range, silhouette_scores, 'bo-')
    plt.axvline(x=optimal_clusters, color='red', linestyle='--', 
               label=f'Optimal: {optimal_clusters} clusters')
    plt.xlabel('Number of Clusters')
    plt.ylabel('Silhouette Score')
    plt.title('Cluster Optimization')
    plt.legend()
    plt.grid(True, alpha=0.3)
    plt.savefig('cluster_optimization.png', dpi=300, bbox_inches='tight')
    plt.show()
    
    print(f"Optimal number of clusters: {optimal_clusters}")
    print(f"Best silhouette score: {max(silhouette_scores):.3f}")
    
    return optimal_clusters

def run_clustering_analysis():
    """
    Run complete hierarchical clustering analysis
    """
    print("Starting Hierarchical Clustering Analysis")
    print("=" * 50)
    
    # Load data
    try:
        data = pd.read_csv('pipeline_monitoring_data.csv')
        data['timestamp'] = pd.to_datetime(data['timestamp'])
        print(f"Loaded {len(data):,} samples")
    except FileNotFoundError:
        print("Error: pipeline_monitoring_data.csv not found. Please run generate_pipeline_data.py first.")
        return
    
    # Filter anomaly data for analysis
    anomaly_data = data[data['is_anomaly'] == True]
    print(f"Found {len(anomaly_data):,} anomaly samples")
    
    # Optimize cluster number (optional - use paper's value of 10)
    # optimal_clusters = optimize_cluster_number(data)
    optimal_clusters = 10  # As per paper
    
    # Perform clustering with optimal parameters
    clustering = AnomalyPatternClustering(
        n_clusters=optimal_clusters,
        linkage='ward',
        distance_metric='euclidean'
    )
    
    clustering.fit_clustering(data)
    
    # Analyze results
    if clustering.is_fitted:
        # Visualize clusters
        silhouette_avg = clustering.visualize_clusters()
        
        # Calculate false positive reduction
        fp_reduction = clustering.calculate_false_positive_reduction(data)
        
        # Identify leak cluster
        leak_cluster = clustering.identify_leak_cluster(data)
        
        # Save model
        clustering.save_model('hierarchical_clustering_model.pkl')
        
        # Summary results
        results = {
            'n_clusters': optimal_clusters,
            'silhouette_score': silhouette_avg,
            'false_positive_reduction': fp_reduction,
            'leak_cluster_id': leak_cluster,
            'total_anomaly_groups': len(clustering.cluster_labels),
            'features_extracted': clustering.features.shape[1]
        }
        
        # Save results
        pd.DataFrame([results]).to_csv('clustering_results.csv', index=False)
        
        print(f"\nClustering Analysis Complete!")
        print(f"Clusters: {optimal_clusters}")
        print(f"Silhouette Score: {silhouette_avg:.3f}")
        print(f"False Positive Reduction: {fp_reduction:.2f}%")
        print(f"Leak Cluster: {leak_cluster}")
        
        return clustering, results
    
    else:
        print("Clustering failed")
        return None, None
