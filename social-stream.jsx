/** @jsx React.DOM */

db = {};
db.media = new Meteor.Collection('media');
db.messages = new Meteor.Collection( 'messages' );

var toIds = function (obj) {
	return obj._id;
}

if ( Meteor.isClient ) {

	var ToggleButton = React.createClass({

		render: function () {
			return this.transferPropsTo(
				<div className="button">
					{this.props.text}
				</div>
			);
		}

	});

	var SelectMedia = React.createClass({

		// start prototype code

		mixins: [ ReactMeteor.Mixin ],

		getMeteorState: function () {
			var selected = _( db.media.find( { _id: { $in: Session.get( 'media.selected' ) } } ).fetch() ).map( toIds );

			return {
				media: db.media.find({}).fetch() || [],
				selected: selected
			}
		},

		changes: {
			media: {
				selected: function (id) {
					var selected = Session.get( 'media.selected' );
					if ( _( selected ).contains( id ) ) {
						Session.set('media.selected', _(selected).without(id));
					} else {
						Session.set( 'media.selected', _( selected ).union([id] ) );
					}
				}
			}
		},

		// end prototype code

		toggleButton: function (id) {
			this.change( 'media.selected', id );
		},

		renderButton: function ( model ) {
			var isSelected = _( this.state.selected ).contains( model._id );
			return (
				<ToggleButton
					key={model._id}
					text={model.name}
					className={isSelected ? "selected" : ""}
					onClick={this.toggleButton.bind( this, model._id )}
				/>
			);
		},

		render: function () {
			return (
				<div className="select-media">
					{_(this.state.media).map(this.renderButton)}
				</div>
			);
		}

	});

	var Message = React.createClass({

		render: function () {
			return this.transferPropsTo(
				<div className="message">
					<span className="text">{this.props.text}</span>
					<span className="time">{this.props.posted}</span>
					<span className="name">{this.props.name}</span>
				</div>
			)
		}

	});

	// Messages compontent
	var Messages = React.createClass( {

		// start prototype code

		mixins: [ ReactMeteor.Mixin ],

		getMeteorState: function ( ) {
			var selected = db.messages.findOne( Session.get( 'messages.selected' ) );
			return {
				messages: db.messages.find( {}, {
					sort: {
						posted: 1,
						name: 1
					}
				} ).fetch( ),
				selected: selected
			};
		},

		changes: {
			messages: {
				selected: function (id) {
					Session.set('messages.selected', id);
				}
			}
		},

		// end prototype code

		selectMessage: function (id) {
			this.change('messages.selected', id);
		},

		renderMessage: function ( model ) {
			var _id = this.state.selected && this.state.selected._id;
			isSelected = _(model._id).isString() ? model._id === _id : model._id.equals(_id);
			return (
				<Message key={model._id}
						 name={model.name}
						 posted={model.posted}
						 text={model.text}
						 className={isSelected ? "selected" : ""}
						 onClick={this.selectMessage.bind( this, model._id )} />
			)
		},

		render: function() {
			return (
				<div className="messages">
					{_(this.state.messages).map(this.renderMessage)}
				</div>
			)

		}
	});

	Meteor.startup( function ( ) {

		Session.set( 'media.selected', []);

		Meteor.autorun(function () {

			var mediaIds = Session.get('media.selected');
			Meteor.subscribe( 'stream', mediaIds, function ( ) {
				React.renderComponent( <Messages />, $('.main')[0] );
			} );

		});

		Meteor.subscribe('media', function () {
			React.renderComponent( <SelectMedia />, $('.controls')[0] );
		});

	} );

}

if ( Meteor.isServer ) {

	db.messages.allow({
		insert: function () {
			return true;
		}
	})

	Meteor.startup( function ( ) {

		if (db.media.find({}).count() === 0) {
			db.media.insert({name: 'facebook'});
			db.media.insert({name: 'twitter'});
			db.media.insert({name: 'google'});
		}

		Meteor.publish( 'stream', function ( mediaIds ) {
			var sort = {
					posted: 1
				};

			if ( _(mediaIds).isArray() && mediaIds.length ) {
				return db.messages.find( { media: { $in: mediaIds } },
										 { sort: sort } );
			}

			return db.messages.find({}, { sort: sort } );

		} );

		Meteor.publish( 'media', function () {
			return db.media.find({});
		} );
	} );
}
