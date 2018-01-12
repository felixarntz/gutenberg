/**
 * External dependencies
 */
import { throttle, uniqueId } from 'lodash';

/**
 * WordPress dependencies
 */
import { Component, getWrapperDisplayName } from '@wordpress/element';
import { addAction, applyFilters, removeAction } from '@wordpress/hooks';

const ANIMATION_FRAME_PERIOD = 16;

/**
 * Creates a higher-order component which adds filtering capability to the wrapped component.
 * Filters get applied when the original component is about to be mounted.
 * When a filter is added or removed that matches the hook name, the wrapped component re-renders.
 *
 * @param {string} hookName Hook name exposed to be used by filters.
 * @returns {Function}      Higher-order component factory.
 */
export default function withFilters( hookName ) {
	return ( OriginalComponent ) => {
		class FilteredComponent extends Component {
			/** @inheritdoc */
			constructor( props ) {
				super( props );

				this.namespace = uniqueId( 'core/with-filters/component-' );
				this.onHooksUpdated = this.onHooksUpdated.bind( this );
				this.applyFiltersAndForceUpdate = throttle( this.applyFiltersAndForceUpdate.bind( this ), ANIMATION_FRAME_PERIOD );

				addAction( 'hookAdded', this.namespace, this.onHooksUpdated );
				addAction( 'hookRemoved', this.namespace, this.onHooksUpdated );

				this.Component = applyFilters( hookName, OriginalComponent );
			}

			/** @inheritdoc */
			componentWillUnmount() {
				this.applyFiltersAndForceUpdate.cancel();
				removeAction( 'hookAdded', this.namespace );
				removeAction( 'hookRemoved', this.namespace );
			}

			/**
			 * When a filter is added or removed for the matching hook name, the wrapped component should re-render.
			 *
			 * @param {string} updatedHookName Name of the hook that was updated.
			 */
			onHooksUpdated( updatedHookName ) {
				if ( updatedHookName === hookName ) {
					this.applyFiltersAndForceUpdate();
				}
			}

			/**
			 * Applies filters for the original component from scratch and forces re-render.
			 */
			applyFiltersAndForceUpdate() {
				this.Component = applyFilters( hookName, OriginalComponent );
				this.forceUpdate();
			}

			/** @inheritdoc */
			render() {
				return <this.Component { ...this.props } />;
			}
		}
		FilteredComponent.displayName = getWrapperDisplayName( OriginalComponent, 'filters' );

		return FilteredComponent;
	};
}
