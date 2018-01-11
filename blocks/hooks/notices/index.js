/**
 * External dependencies
 */
import uuid from 'uuid/v4';

/**
 * WordPress dependencies
 */
import { Component, getWrapperDisplayName } from '@wordpress/element';
import { addFilter } from '@wordpress/hooks';
import { NoticeList } from '@wordpress/components';

/**
 * Internal dependencies
 */
import { hasBlockSupport } from '../../api';
import './editor.scss';

/**
 * Override the default edit UI to include notices if supported.
 *
 * @param  {function|Component} BlockEdit Original component.
 * @return {function}                     Wrapped component.
 */
export function withNotices( BlockEdit ) {
	class WrappedBlockEdit extends Component {
		constructor() {
			super( ...arguments );

			this.addNotice = this.addNotice.bind( this );
			this.removeNotice = this.removeNotice.bind( this );

			this.state = {
				notices: [],
			};
		}

		addNotice( notice ) {
			const noticeToAdd = notice.id ? notice : { ...notice, id: uuid() };
			this.setState( state => ( {
				notices: [ ...state.notices, noticeToAdd ],
			} ) );
		}

		removeNotice( id ) {
			this.setState( state => ( {
				notices: state.notices.filter( notice => notice.id !== id ),
			} ) );
		}

		render() {
			if ( ! hasBlockSupport( this.props.name, 'notices' ) ) {
				return <BlockEdit key="block-edit" { ...this.props } />;
			}

			return [
				<NoticeList key="block-notices" className="block-notices" notices={ this.state.notices } onRemove={ this.removeNotice } />,
				<BlockEdit key="block-edit" { ...this.props } createNotice={ this.addNotice } />,
			];
		}
	}
	WrappedBlockEdit.displayName = getWrapperDisplayName( BlockEdit, 'notices' );

	return WrappedBlockEdit;
}

addFilter( 'blocks.BlockEdit', 'core/notices', withNotices );
