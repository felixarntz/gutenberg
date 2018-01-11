/**
 * External depednencies
 */
import { noop } from 'lodash';

/**
 * Internal dependencies
 */
import Notice from './';

function NoticeList( { notices, onRemove = noop, className = 'components-notice-list' } ) {
	const removeNotice = ( id ) => () => onRemove( id );

	return (
		<div className={ className }>
			{ [ ...notices ].reverse().map( ( notice ) => (
				<Notice { ...notice } key={ notice.id } onRemove={ removeNotice( notice.id ) } />
			) ) }
		</div>
	);
}

export default NoticeList;
