import { Platform, StyleSheet, Text, View } from 'react-native';
import MapView, { Marker, Polyline, PROVIDER_GOOGLE } from 'react-native-maps';
import { canRenderMap } from '../config/maps';
import { colors } from '../theme';

const mapProvider = Platform.OS === 'android' ? PROVIDER_GOOGLE : undefined;

export function WalkMap({
  mapRef,
  currentLocation,
  path = [],
  interactive = true,
  showsUserLocation = true,
  style,
}) {
  if (!canRenderMap()) {
    return (
      <View style={[styles.placeholder, style]}>
        <Text style={styles.placeholderEmoji}>🗺️</Text>
        <Text style={styles.placeholderTitle}>Картата е паузирана</Text>
        <Text style={styles.placeholderText}>
          За Android release трябва Google Maps API ключ в app.json. Разходката и
          разстоянието продължават да се следят нормално.
        </Text>
        {currentLocation ? (
          <Text style={styles.coords}>
            GPS: {currentLocation.latitude.toFixed(5)},{' '}
            {currentLocation.longitude.toFixed(5)}
          </Text>
        ) : null}
      </View>
    );
  }

  const initial =
    currentLocation ||
    path[0] || {
      latitude: 42.6977,
      longitude: 23.3219,
    };

  return (
    <MapView
      ref={mapRef}
      style={[styles.map, style]}
      provider={mapProvider}
      showsUserLocation={showsUserLocation}
      followsUserLocation={interactive && showsUserLocation}
      scrollEnabled={interactive}
      zoomEnabled={interactive}
      initialRegion={{
        ...initial,
        latitudeDelta: interactive ? 0.01 : 0.02,
        longitudeDelta: interactive ? 0.01 : 0.02,
      }}
    >
      {path.length > 1 ? (
        <Polyline coordinates={path} strokeColor={colors.warmCoral} strokeWidth={5} />
      ) : null}
      {path[0] ? <Marker coordinate={path[0]} title="Старт" pinColor="#F4A261" /> : null}
      {!interactive && path.length > 1 ? (
        <Marker
          coordinate={path[path.length - 1]}
          title="Край"
          pinColor="#E07A5F"
        />
      ) : null}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: {
    width: '100%',
    height: '100%',
  },
  placeholder: {
    flex: 1,
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    backgroundColor: colors.softCream,
  },
  placeholderEmoji: {
    fontSize: 36,
    marginBottom: 8,
  },
  placeholderTitle: {
    fontFamily: 'Nunito_800ExtraBold',
    fontSize: 18,
    color: colors.chocolate,
    marginBottom: 8,
    textAlign: 'center',
  },
  placeholderText: {
    fontFamily: 'Nunito_600SemiBold',
    fontSize: 14,
    color: colors.cocoa,
    textAlign: 'center',
    lineHeight: 20,
  },
  coords: {
    marginTop: 12,
    fontFamily: 'Nunito_700Bold',
    fontSize: 12,
    color: colors.pawBrown,
  },
});
